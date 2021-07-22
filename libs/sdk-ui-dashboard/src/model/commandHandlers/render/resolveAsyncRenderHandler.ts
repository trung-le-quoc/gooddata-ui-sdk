// (C) 2021 GoodData Corporation
import { DashboardContext } from "../../types/commonTypes";
import { internalErrorOccurred } from "../../events/general";
import { ResolveAsyncRender } from "../../commands/render";
import { asyncRenderResolved } from "../../events/render";

export function resolveAsyncRenderHandler(ctx: DashboardContext, cmd: ResolveAsyncRender): any {
    // eslint-disable-next-line no-console
    console.debug("handling resolve async render for export", cmd, "in context", ctx);

    try {
        const {
            payload: { id },
            correlationId,
        } = cmd;

        return asyncRenderResolved(id, ctx, correlationId);
    } catch (e) {
        throw internalErrorOccurred(
            ctx,
            "An unexpected error has occurred while resolving async rendering for the export",
            e,
            cmd.correlationId,
        );
    }
}