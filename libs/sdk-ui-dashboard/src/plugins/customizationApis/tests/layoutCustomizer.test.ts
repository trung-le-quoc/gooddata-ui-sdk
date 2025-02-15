// (C) 2021-2022 GoodData Corporation

import { DashboardCustomizationLogger } from "../customizationLogging";
import { DefaultLayoutCustomizer } from "../layoutCustomizer";
import { ExtendedDashboardWidget } from "../../../model";
import { idRef, IDashboard } from "@gooddata/sdk-model";

const EmptyDashboard: IDashboard<ExtendedDashboardWidget> = {
    type: "IDashboard",
    uri: "/1",
    identifier: "1",
    ref: idRef("1"),
    title: "Empty Dashboard",
    description: "",
    created: "",
    updated: "",
    layout: {
        type: "IDashboardLayout",
        sections: [],
    },
    shareStatus: "private",
};

describe("layout customizer", () => {
    let Customizer: DefaultLayoutCustomizer;

    beforeEach(() => {
        Customizer = new DefaultLayoutCustomizer(new DashboardCustomizationLogger());
    });

    it("should allow fluid layout customization and deal with transform returning undefined", () => {
        const customizationFn = jest.fn();
        Customizer.customizeFluidLayout(customizationFn);
        const transformFn = Customizer.getExistingDashboardTransformFn();

        expect(transformFn(EmptyDashboard)).toEqual(EmptyDashboard);
        expect(customizationFn).toHaveBeenCalledTimes(1);
    });

    it("should allow multiple fluid layout customizations and deal with transforms returning undefined", () => {
        const customizationFn1 = jest.fn();
        const customizationFn2 = jest.fn();
        Customizer.customizeFluidLayout(customizationFn1);
        Customizer.customizeFluidLayout(customizationFn2);
        const transformFn = Customizer.getExistingDashboardTransformFn();

        expect(transformFn(EmptyDashboard)).toEqual(EmptyDashboard);
        expect(customizationFn1).toHaveBeenCalledTimes(1);
        expect(customizationFn2).toHaveBeenCalledTimes(1);
    });

    it("should ignore errors during transformation", () => {
        Customizer.customizeFluidLayout(() => {
            throw Error();
        });
        const transformFn = Customizer.getExistingDashboardTransformFn();

        expect(transformFn(EmptyDashboard)).toEqual(EmptyDashboard);
    });

    it("should return undefined if dashboard has no layout", () => {
        const DashboardWithNoLayout = { ...EmptyDashboard, layout: undefined };
        const customizationFn = jest.fn();
        Customizer.customizeFluidLayout(customizationFn);
        const transformFn = Customizer.getExistingDashboardTransformFn();

        expect(transformFn(DashboardWithNoLayout)).toBeUndefined();
    });
});
