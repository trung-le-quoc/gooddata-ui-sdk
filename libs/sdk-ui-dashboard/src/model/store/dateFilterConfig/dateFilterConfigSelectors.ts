// (C) 2021-2022 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import invariant from "ts-invariant";
import { DateFilterGranularity, DashboardDateFilterConfigMode } from "@gooddata/sdk-model";
import { IDateFilterOptionsByType } from "@gooddata/sdk-ui-filters";

import { convertDateFilterConfigToDateFilterOptions } from "../../../_staging/dateFilterConfig/dateFilterConfigConverters";
import { DashboardState } from "../types";
import { selectIsInEditMode } from "../ui/uiSelectors";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.dateFilterConfig,
);

/**
 * Returns date filter config that is specified on the loaded dashboard.
 *
 * The dashboard-level date filter configuration MAY contain overrides and additional configuration to apply
 * on top of the workspace-level date filter config. If the dashboard-level overrides are not specified, then
 * the workspace-level config should be taken as-is.
 *
 * @remarks See {@link selectEffectiveDateFilterConfig} - you can use this selector to obtain the effective
 *  date filter config that contains the final config obtained by merging the workspace-level config and the
 *  dashboard-level overrides.
 *
 * @alpha
 */
export const selectDateFilterConfigOverrides = createSelector(selectSelf, (dateFilterConfigState) => {
    return dateFilterConfigState.dateFilterConfig;
});

/**
 * Returns effective date filter config. The effective date filter config is created by merging the workspace-level
 * date filter config and the dashboard-level date filter config.
 *
 * This is the configuration that the DateFilter SHOULD use when rendering filtering presets.
 *
 * @alpha
 */
export const selectEffectiveDateFilterConfig = createSelector(selectSelf, (dateFilterConfigState) => {
    invariant(
        dateFilterConfigState.effectiveDateFilterConfig,
        "attempting to access uninitialized date filter config state",
    );

    return dateFilterConfigState.effectiveDateFilterConfig!;
});

/**
 * Returns effective date filter options. This is created by merging the workspace-level
 * date filter config and the dashboard-level date filter config.
 *
 * These are the date filter options that the DateFilter SHOULD use when rendering filtering presets.
 *
 * @alpha
 */
export const selectEffectiveDateFilterOptions = createSelector(
    selectEffectiveDateFilterConfig,
    (effectiveDateFilterConfig): IDateFilterOptionsByType =>
        convertDateFilterConfigToDateFilterOptions(effectiveDateFilterConfig),
);

/**
 * Returns effective date filter options from. This is created by merging the workspace-level
 * date filter config and the dashboard-level date filter config.
 *
 * These are the date filter options that the DateFilter SHOULD use when rendering filtering presets.
 *
 * @alpha
 */
export const selectEffectiveDateFilterAvailableGranularities = createSelector(
    selectEffectiveDateFilterConfig,
    (effectiveDateFilterConfig): DateFilterGranularity[] =>
        effectiveDateFilterConfig.relativeForm?.availableGranularities ?? [],
);

/**
 * Indicates whether the effective date filter is using dashboard-level overrides.
 */
const effectiveDateFilterConfigIsUsingOverrides = createSelector(selectSelf, (dateFilterConfigState) => {
    invariant(
        dateFilterConfigState.isUsingDashboardOverrides !== undefined,
        "attempting to access uninitialized date filter config state",
    );

    return dateFilterConfigState.isUsingDashboardOverrides!;
});

/**
 * Returns custom title to use for the date filter. Custom title comes from the dashboard-level date filter config overrides. If no overrides
 * were defined OR the effective date filter config is not using them (because applying them means the final date filter config is invalid),
 * then no custom filter should be used.
 *
 * @alpha
 */
export const selectEffectiveDateFilterTitle = createSelector(
    effectiveDateFilterConfigIsUsingOverrides,
    selectDateFilterConfigOverrides,
    (isUsingOverrides, dashboardOverrides) => {
        if (!isUsingOverrides) {
            return undefined;
        }

        // If this happens then the load command handler does not work correctly - it sets that the overrides are used
        // while there are none.
        invariant(dashboardOverrides !== undefined);

        return dashboardOverrides.filterName;
    },
);

/**
 * Returns display mode for the effective date filter. This always comes from the dashboard-level date filter config overrides - regardless whether
 * the rest of the overrides are actually used.
 *
 * @alpha
 */
export const selectEffectiveDateFilterMode = createSelector(
    selectIsInEditMode,
    selectDateFilterConfigOverrides,
    (isInEditMode, dashboardOverrides): DashboardDateFilterConfigMode => {
        if (isInEditMode) {
            return "active";
        }

        return dashboardOverrides?.mode ?? "active";
    },
);
