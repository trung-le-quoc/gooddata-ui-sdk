// (C) 2021 GoodData Corporation
import { DashboardContext } from "../../../types/commonTypes";
import { IWorkspaceCatalog, IWorkspaceCatalogFactoryOptions } from "@gooddata/sdk-backend-spi";
import { DateAttributeGranularity } from "@gooddata/sdk-model";

const SupportedCatalogGranularity: DateAttributeGranularity[] = [
    "GDC.time.day_in_week",
    "GDC.time.day_in_month",
    "GDC.time.day_in_quarter",
    "GDC.time.day_in_year",
    "GDC.time.week_in_quarter",
    "GDC.time.week_in_year",
    "GDC.time.month_in_quarter",
    "GDC.time.month_in_year",
    "GDC.time.quarter_in_year",
];

export function loadCatalog(ctx: DashboardContext): Promise<IWorkspaceCatalog> {
    const { backend, workspace } = ctx;

    const options: IWorkspaceCatalogFactoryOptions = {
        excludeTags: [],
        includeTags: [],
        types: ["attribute", "fact", "measure", "dateDataset"],
        includeDateGranularities: SupportedCatalogGranularity,
    };

    return backend.workspace(workspace).catalog().withOptions(options).load();
}
