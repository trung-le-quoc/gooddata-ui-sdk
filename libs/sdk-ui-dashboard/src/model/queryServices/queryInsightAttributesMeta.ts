// (C) 2021 GoodData Corporation
import { DashboardContext } from "../types/commonTypes";
import { SagaIterator } from "redux-saga";
import {
    InsightDisplayFormUsage,
    insightDisplayFormUsage,
    ObjRef,
    objRefToString,
    serializeObjRef,
} from "@gooddata/sdk-model";
import { createCachedQueryService } from "../state/_infra/queryService";
import { InsightAttributesMeta, QueryInsightAttributesMeta } from "../queries";
import { selectInsightByRef } from "../state/insights/insightsSelectors";
import { call, select } from "redux-saga/effects";
import { invalidQueryArguments } from "../events/general";
import {
    selectAllCatalogAttributesMap,
    selectAllCatalogDisplayFormsMap,
} from "../state/catalog/catalogSelectors";
import {
    IAttributeDisplayFormMetadataObject,
    IAttributeMetadataObject,
    ICatalogAttribute,
    ICatalogDateAttribute,
} from "@gooddata/sdk-backend-spi";
import keyBy from "lodash/keyBy";
import { invariant } from "ts-invariant";

export const QueryInsightAttributesMetaService = createCachedQueryService(
    "GDC.DASH/QUERY.INSIGHT.ATTRIBUTE.META",
    queryService,
    (query: QueryInsightAttributesMeta) => serializeObjRef(query.payload.insightRef),
);

/**
 * Selector that will return attribute metadata for an insight. The input to the selector is the dashboard query that is used
 * to obtain and cache the data.
 *
 * This selector will return undefined if the query to obtain the data for particular insight was not yet fired or
 * processed. Otherwise will return object containing `status` of the data retrieval; if the `status` is
 * `'success'` then the `result` prop will contain the data.
 *
 * @remarks see {@link QueryInsightAttributesMeta}
 * @internal
 */
export const selectInsightAttributesMeta = QueryInsightAttributesMetaService.cache.selectQueryResult;

//
// Query implementation
//

async function loadDisplayFormsAndAttributes(ctx: DashboardContext, displayFormRefs: ObjRef[]) {
    const { backend, workspace } = ctx;

    const displayForms = await backend
        .workspace(workspace)
        .attributes()
        .getAttributeDisplayForms(displayFormRefs);
    const attributes = await backend
        .workspace(workspace)
        .attributes()
        .getAttributes(displayForms.map((df) => df.attribute));

    return {
        loadedDisplayForms: keyBy(displayForms, (df) => serializeObjRef(df.ref)),
        loadedAttributes: keyBy(attributes, (a) => serializeObjRef(a.ref)),
    };
}

/**
 * Loads insight attribute and display form metadata for particular insight display form usage.
 *
 * This function will first attempt to find display forms & attributes in the catalog - for a quick in memory hit.
 *
 * However in corner cases some of the display forms and attributes may not be stored in catalog. That is the case when dashboard
 * contains an insight created from date datasets created from custom CSVs. These are not stored in the 'default' catalog
 * that is part of the dashboard component's state. That's when the function falls back to load the metadata from backend.
 */
async function createInsightAttributesMeta(
    ctx: DashboardContext,
    usage: InsightDisplayFormUsage,
    catalogDisplayForms: Record<string, IAttributeDisplayFormMetadataObject>,
    catalogAttributes: Record<string, ICatalogAttribute | ICatalogDateAttribute>,
): Promise<InsightAttributesMeta> {
    const allUsedRefs = [...usage.inAttributes, ...usage.inFilters, ...usage.inMeasureFilters];
    const displayFormsFromCatalog: IAttributeDisplayFormMetadataObject[] = [];
    const missingDisplayForms: ObjRef[] = [];

    allUsedRefs.forEach((ref) => {
        const catalogDisplayForm = catalogDisplayForms[serializeObjRef(ref)];

        if (!catalogDisplayForm) {
            displayFormsFromCatalog.push(catalogDisplayForm);
        } else {
            missingDisplayForms.push(ref);
        }
    });

    const attributesFromCatalog: IAttributeMetadataObject[] = displayFormsFromCatalog.map((df) => {
        const catalogAttribute = catalogAttributes[serializeObjRef(df.attribute)];

        // if this bombs there must be something seriously wrong because it means a display form is in catalog
        // but the attribute to which it belongs is not. such a thing can only happen if something is messing
        // around with the catalog state stored in the component.
        invariant(catalogAttribute, "dashboard metadata catalog is corrupted");

        return catalogAttribute.attribute;
    });

    const { loadedDisplayForms, loadedAttributes } = await loadDisplayFormsAndAttributes(
        ctx,
        missingDisplayForms,
    );

    return {
        usage,
        attributes: {
            ...keyBy(attributesFromCatalog, (a) => serializeObjRef(a.ref)),
            ...loadedAttributes,
        },
        displayForms: {
            ...keyBy(displayFormsFromCatalog, (df) => serializeObjRef(df.ref)),
            ...loadedDisplayForms,
        },
    };
}

function* queryService(
    ctx: DashboardContext,
    query: QueryInsightAttributesMeta,
): SagaIterator<InsightAttributesMeta> {
    const {
        correlationId,
        payload: { insightRef },
    } = query;
    const insightSelector = selectInsightByRef(insightRef);
    const insight: ReturnType<typeof insightSelector> = yield select(insightSelector);

    if (!insight) {
        throw invalidQueryArguments(
            ctx,
            `Insight with ref ${objRefToString(insightRef)} does not exist on the dashboard`,
            correlationId,
        );
    }

    const usage = insightDisplayFormUsage(insight);
    const catalogDisplayForms: ReturnType<typeof selectAllCatalogDisplayFormsMap> = yield select(
        selectAllCatalogDisplayFormsMap,
    );
    const catalogAttributes: ReturnType<typeof selectAllCatalogAttributesMap> = yield select(
        selectAllCatalogAttributesMap,
    );

    return yield call(createInsightAttributesMeta, ctx, usage, catalogDisplayForms, catalogAttributes);
}
