// (C) 2007-2022 GoodData Corporation
import React from "react";
import { ICatalogDateDataset, isInsightWidget, IWidget, ObjRef } from "@gooddata/sdk-model";
import { FormattedMessage } from "react-intl";
import Measure from "react-measure";
import { DateDatasetDropdown } from "./DateDatasetDropdown";
import { getUnrelatedDateDataset } from "./utils";

export interface IDateDatasetPickerProps {
    autoOpen?: boolean;
    autoOpenChanged: (widgetRef: ObjRef, autoOpen: boolean) => void;
    widget: IWidget;
    relatedDateDatasets: ICatalogDateDataset[] | undefined;
    selectedDateDataset?: ICatalogDateDataset;
    selectedDateDatasetHidden?: boolean;

    unrelatedDateDataset?: ICatalogDateDataset;
    dateFromVisualization?: ICatalogDateDataset;
    onDateDatasetChange: (id: string) => void;
    className?: string;
    width: number;
    isLoading?: boolean;
}

export const DateDatasetPicker: React.FC<IDateDatasetPickerProps> = (props) => {
    const {
        relatedDateDatasets,
        selectedDateDataset,
        selectedDateDatasetHidden,
        widget,
        dateFromVisualization,
        autoOpen,
        autoOpenChanged,
        isLoading,
        width,
        onDateDatasetChange,
    } = props;

    const unrelatedDateDataset =
        relatedDateDatasets &&
        getUnrelatedDateDataset(relatedDateDatasets, selectedDateDataset, selectedDateDatasetHidden);

    const getDateFilter = (measureRef: React.Ref<HTMLDivElement> | undefined, width: number) => (
        <div className="subcategory-dropdown" ref={measureRef}>
            <DateDatasetDropdown
                autoOpenChanged={autoOpenChanged}
                autoOpen={autoOpen}
                widgetRef={widget.ref}
                className="s-filter-date-dropdown"
                relatedDateDatasets={relatedDateDatasets ?? []}
                activeDateDataset={selectedDateDataset}
                unrelatedDateDataset={unrelatedDateDataset}
                dateFromVisualization={dateFromVisualization}
                onDateDatasetChange={onDateDatasetChange}
                isLoading={isLoading}
                width={width}
            />
        </div>
    );

    return (
        <div>
            <div className="configuration-subcategory">
                <label
                    className="s-filter-date-dropdown-heading subcategory-label"
                    htmlFor="s-filter-date-dropdown"
                >
                    <FormattedMessage id="configurationPanel.dateAs" />
                </label>
                {width ? (
                    getDateFilter(undefined, width)
                ) : (
                    <Measure>
                        {({ measureRef, contentRect }) =>
                            getDateFilter(measureRef, contentRect.entry.width || 0)
                        }
                    </Measure>
                )}
            </div>
            {!!(unrelatedDateDataset && !isLoading) && (
                <div className="gd-message error s-unrelated-date">
                    {isInsightWidget(widget) ? (
                        <FormattedMessage
                            id="configurationPanel.unrelatedVizDateInfo"
                            values={{ dateDataSet: unrelatedDateDataset.dataSet.title }}
                        />
                    ) : (
                        <FormattedMessage
                            id="configurationPanel.unrelatedKpiDateInfo"
                            values={{ dateDataSet: unrelatedDateDataset.dataSet.title }}
                        />
                    )}
                </div>
            )}
        </div>
    );
};
