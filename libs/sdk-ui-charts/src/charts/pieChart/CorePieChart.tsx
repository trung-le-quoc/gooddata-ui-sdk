// (C) 2007-2022 GoodData Corporation
import React from "react";
import { ICoreChartProps } from "../../interfaces";
import { BaseChart } from "../_base/BaseChart";

export class CorePieChart extends React.PureComponent<ICoreChartProps, null> {
    public render() {
        return <BaseChart type="pie" {...this.props} />;
    }
}
