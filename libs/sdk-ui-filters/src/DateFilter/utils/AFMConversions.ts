// (C) 2007-2020 GoodData Corporation
import { IAbsoluteDateFilter, IRelativeDateFilter, ObjRef, IDateFilter } from "@gooddata/sdk-model";
import { applyExcludeCurrentPeriod } from "./PeriodExclusion";
import {
    AbsoluteDateFilterOption,
    RelativeDateFilterOption,
    isAbsoluteDateFilterOption,
    DateFilterOption,
    isRelativeDateFilterOption,
} from "../interfaces";
import { isAllTimeDateFilterOption } from "@gooddata/sdk-backend-spi";

export const mapAbsoluteFilterToAfm = (
    value: AbsoluteDateFilterOption,
    dataSet: ObjRef,
): IAbsoluteDateFilter => ({
    absoluteDateFilter: {
        dataSet,
        from: value.from,
        to: value.to,
    },
});

export const mapRelativeFilterToAfm = (
    value: RelativeDateFilterOption,
    dataSet: ObjRef,
): IRelativeDateFilter => ({
    relativeDateFilter: {
        dataSet,
        from: value.from,
        to: value.to,
        granularity: value.granularity,
    },
});

export const mapOptionToAfm = (
    value: DateFilterOption,
    dateDataSet: ObjRef,
    excludeCurrentPeriod: boolean,
): IDateFilter => {
    const excludeApplied = applyExcludeCurrentPeriod(value, excludeCurrentPeriod);

    if (isAllTimeDateFilterOption(excludeApplied)) {
        return null;
    }

    if (isAbsoluteDateFilterOption(excludeApplied)) {
        return mapAbsoluteFilterToAfm(excludeApplied, dateDataSet);
    }

    if (isRelativeDateFilterOption(excludeApplied)) {
        return mapRelativeFilterToAfm(excludeApplied, dateDataSet);
    }

    throw new Error("Unknown date filter value provided");
};
