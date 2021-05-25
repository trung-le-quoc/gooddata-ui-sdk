// (C) 2021 GoodData Corporation

import { IDashboard } from "@gooddata/sdk-backend-spi";
import { IInsight } from "@gooddata/sdk-model";
import { DashboardConfig, DashboardContext } from "../types/commonTypes";
import { DateFilterConfigValidationResult } from "../_staging/dateFilterConfig/validation";

/**
 * @internal
 */
export type DashboardEventType = "GDC.DASHBOARD.EVT.LOADED" | "GDC.DASHBOARD.EVT.DF.VALIDATION.FAILED";

/**
 * Base type for all dashboard events.
 *
 * @internal
 */
export interface IDashboardEvent {
    /**
     * Event type. Always starts with "GDC.DASHBOARD.EVT".
     */
    readonly type: DashboardEventType;

    /**
     * If this event was triggered as part of a command processing, then the prop will contain command's correlation ID.
     */
    readonly correlationId?: string;

    /**
     * Dashboard context in which the event occurred.
     */
    readonly ctx: DashboardContext;
}

//
//
//

/**
 * This event is emitted when a dashboard is successfully loaded. It contains contextual information and then
 * the dashboard.
 *
 * @internal
 */
export interface DashboardLoaded extends IDashboardEvent {
    type: "GDC.DASHBOARD.EVT.LOADED";
    payload: {
        /**
         * Loaded dashboard.
         */
        dashboard: IDashboard;

        /**
         * Insights used on the dashboard.
         */
        insights: IInsight[];

        /**
         * Configuration
         */
        config: DashboardConfig;
    };
}

/**
 *
 * @param ctx
 * @param dashboard
 * @param insights
 * @param correlationId
 *
 */
export function dashboardLoaded(
    ctx: DashboardContext,
    dashboard: IDashboard,
    insights: IInsight[],
    config: DashboardConfig,
    correlationId?: string,
): DashboardLoaded {
    return {
        type: "GDC.DASHBOARD.EVT.LOADED",
        ctx,
        correlationId,
        payload: {
            dashboard,
            insights,
            config,
        },
    };
}

//
//
//

/**
 * @internal
 */
export type DateFilterValidationResult = "TOO_MANY_CONFIGS" | "NO_CONFIG" | DateFilterConfigValidationResult;

/**
 * This event may occur while the dashboard is handling the Load Dashboard command and is loading and validating
 * dashboard configuration from the backend.
 *
 * Part of that process is obtaining workspace's Date Filter configuration. If the date filter config stored in
 * workspace has issues, then this event will occur.
 *
 * Note that this event is not a show stopper. The dashboard load will recover and fall back to a safe date
 * filter configuration.
 *
 * @internal
 */
export interface DateFilterValidationFailed extends IDashboardEvent {
    type: "GDC.DASHBOARD.EVT.DF.VALIDATION.FAILED";
    payload: {
        result: DateFilterValidationResult;
    };
}

/**
 * @internal
 */
export function dateFilterValidationFailed(
    ctx: DashboardContext,
    result: DateFilterValidationResult,
    correlationId?: string,
): DateFilterValidationFailed {
    return {
        type: "GDC.DASHBOARD.EVT.DF.VALIDATION.FAILED",
        ctx,
        correlationId,
        payload: {
            result,
        },
    };
}

/**
 * @internal
 */
export type DashboardEvents = DashboardLoaded | DateFilterValidationFailed;
