// (C) 2020-2021 GoodData Corporation
import { useCallback } from "react";
import isEqual from "lodash/isEqual";
import {
    useDashboardSelector,
    useDashboardDispatch,
    selectDrillTargetsByWidgetRef,
    addDrillTargets,
    selectInsightWidgetDrillableItems,
    selectInsightWidgetImplicitDrillsAndDrillDownsByRef,
} from "../../../../../model";
import { IInsightWidget } from "@gooddata/sdk-backend-spi";
import { OnWidgetDrill } from "../../../../drill/types";
import { DataViewFacade, IDrillEvent, IPushData, isSomeHeaderPredicateMatched } from "@gooddata/sdk-ui";
import { IDashboardDrillEvent } from "../../../../../types";
import { IInsight } from "@gooddata/sdk-model";
/**
 * @internal
 */
export interface UseDashboardInsightDrillsProps {
    widget: IInsightWidget;
    insight: IInsight;
    onDrill?: OnWidgetDrill;
}

/**
 * @internal
 */
export const useDashboardInsightDrills = ({
    widget,
    insight,
    onDrill: onDrillFn,
}: UseDashboardInsightDrillsProps) => {
    const dispatch = useDashboardDispatch();
    const drillTargets = useDashboardSelector(selectDrillTargetsByWidgetRef(widget.ref));

    const onPushData = useCallback(
        (data: IPushData): void => {
            if (
                data?.availableDrillTargets &&
                !isEqual(drillTargets?.availableDrillTargets, data.availableDrillTargets)
            ) {
                dispatch(addDrillTargets(widget.ref, data.availableDrillTargets));
            }
        },
        [drillTargets],
    );

    const drillableItems = useDashboardSelector(selectInsightWidgetDrillableItems(widget.ref));
    const implicitDrillDefinitions = useDashboardSelector(
        selectInsightWidgetImplicitDrillsAndDrillDownsByRef(widget.ref),
    );

    const onDrill = onDrillFn
        ? (event: IDrillEvent) => {
              const facade = DataViewFacade.for(event.dataView);

              const matchingImplicitDrillDefinitions = implicitDrillDefinitions.filter((info) => {
                  return event.drillContext.intersection?.some((intersection) =>
                      isSomeHeaderPredicateMatched(info.predicates, intersection.header, facade),
                  );
              });

              const drillEvent: IDashboardDrillEvent = {
                  ...event,
                  widgetRef: widget.ref,
                  drillDefinitions: matchingImplicitDrillDefinitions.map((info) => info.drillDefinition),
              };
              return (
                  typeof onDrillFn === "function" &&
                  onDrillFn(drillEvent, {
                      insight,
                      widget,
                  })
              );
          }
        : undefined;

    return {
        drillableItems,
        onPushData,
        onDrill,
    };
};