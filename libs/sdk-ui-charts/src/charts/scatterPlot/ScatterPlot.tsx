// (C) 2007-2022 GoodData Corporation
import React from "react";
import { IAttribute, IMeasure, INullableFilter, ISortItem, newBucket } from "@gooddata/sdk-model";
import {
    BucketNames,
    useResolveValuesWithPlaceholders,
    MeasureOrPlaceholder,
    NullableFiltersOrPlaceholders,
    SortsOrPlaceholders,
    AttributeOrPlaceholder,
} from "@gooddata/sdk-ui";
import { pointyChartDimensions } from "../_commons/dimensions";
import { IBucketChartProps } from "../../interfaces";
import { CoreScatterPlot } from "./CoreScatterPlot";
import { IChartDefinition } from "../_commons/chartDefinition";
import { withChart } from "../_base/withChart";

//
// Internals
//

const scatterPlotDefinition: IChartDefinition<IScatterPlotBucketProps, IScatterPlotProps> = {
    chartName: "ScatterPlot",
    bucketPropsKeys: ["xAxisMeasure", "yAxisMeasure", "attribute", "filters", "sortBy"],
    bucketsFactory: (props) => {
        return [
            newBucket(BucketNames.MEASURES, props.xAxisMeasure as IMeasure),
            newBucket(BucketNames.SECONDARY_MEASURES, props.yAxisMeasure as IMeasure),
            newBucket(BucketNames.ATTRIBUTE, props.attribute as IAttribute),
        ];
    },
    executionFactory: (props, buckets) => {
        const { backend, workspace, execConfig } = props;

        return backend
            .withTelemetry("ScatterPlot", props)
            .workspace(workspace)
            .execution()
            .forBuckets(buckets, props.filters as INullableFilter[])
            .withSorting(...(props.sortBy as ISortItem[]))
            .withDimensions(pointyChartDimensions)
            .withExecConfig(execConfig);
    },
};

//
// Public interface
//

/**
 * @public
 */
export interface IScatterPlotBucketProps {
    /**
     * Specify measure which will be used to position data points on the X axis.
     */
    xAxisMeasure?: MeasureOrPlaceholder;

    /**
     * Specify measure which will be used to position data points on the Y axis.
     */
    yAxisMeasure?: MeasureOrPlaceholder;

    /**
     * Specify attribute whose values will be used to create data points.
     */
    attribute?: AttributeOrPlaceholder;

    /**
     * Specify filters to apply on the data to chart.
     */
    filters?: NullableFiltersOrPlaceholders;

    /**
     * Specify how to sort the data to chart.
     */
    sortBy?: SortsOrPlaceholders;

    /**
     * Resolution context for composed placeholders.
     */
    placeholdersResolutionContext?: any;
}

/**
 * @public
 */
export interface IScatterPlotProps extends IBucketChartProps, IScatterPlotBucketProps {}

const WrappedScatterPlot = withChart(scatterPlotDefinition)(CoreScatterPlot);

/**
 * Scatter plot shows data as points using Cartesian coordinates.
 *
 * @remarks
 * Scatter plots typically have a minimum of two measures, one for the X-axis and the other for the Y-axis, and one
 * attribute, which determines the meaning of each data point. Scatter plots are useful for analyzing trends between
 * two measures or for tracking the magnitude of two measures from the same chart.
 *
 * See {@link IScatterPlotProps} to learn how to configure the ScatterPlot and the
 * {@link https://sdk.gooddata.com/gooddata-ui/docs/scatter_plot_component.html | scatter plot documentation} for more information.
 *
 * @public
 */
export const ScatterPlot = (props: IScatterPlotProps) => {
    const [xAxisMeasure, yAxisMeasure, attribute, filters, sortBy] = useResolveValuesWithPlaceholders(
        [props.xAxisMeasure, props.yAxisMeasure, props.attribute, props.filters, props.sortBy],
        props.placeholdersResolutionContext,
    );

    return (
        <WrappedScatterPlot
            {...props}
            {...{
                xAxisMeasure,
                yAxisMeasure,
                attribute,
                filters,
                sortBy,
            }}
        />
    );
};
