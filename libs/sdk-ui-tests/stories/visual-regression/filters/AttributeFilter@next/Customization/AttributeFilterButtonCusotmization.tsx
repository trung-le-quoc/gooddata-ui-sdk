// (C) 2022 GoodData Corporation
import React from "react";
import { AttributeFilterBase } from "@gooddata/sdk-ui-filters/dist/AttributeFilter@next/AttributeFilterBase";
import { AttributeFilterDefaultComponents } from "@gooddata/sdk-ui-filters/dist/AttributeFilter@next/Context/AttributeFilterDefaultComponents";
import { AttributeFilterButton } from "@gooddata/sdk-ui-filters/dist/AttributeFilter@next/Components/AttributeFilterButton";

import { IAttributeFilterButtonProps } from "@gooddata/sdk-ui-filters/dist/AttributeFilter@next/Components/types";

import { AttributeFilterSimpleButtonWithSelection } from "@gooddata/sdk-ui-filters/dist/AttributeFilter@next/Components/AttributeFilterSimpleButton";

import { ReferenceMd } from "@gooddata/reference-workspace";
import { storiesOf } from "../../../../_infra/storyRepository";
import { action } from "@storybook/addon-actions";
import { FilterStories } from "../../../../_infra/storyGroups";

import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";
import { newNegativeAttributeFilter } from "@gooddata/sdk-model";
import { ReferenceWorkspaceId, StorybookBackend } from "../../../../_infra/backend";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };
const backend = StorybookBackend();

const CustomComponent = (props: IAttributeFilterButtonProps) => {
    return (
        <div style={{ border: "1px solid black" }}>
            <AttributeFilterDefaultComponents.AttributeFilterButton {...props} title={"Filter"} />
        </div>
    );
};

storiesOf(`${FilterStories}@next/AttributeFilterBase/Customization/FilterButton`)
    .add("Default component", () => {
        return (
            <div style={wrapperStyle} className="screenshot-target">
                <AttributeFilterBase
                    backend={backend}
                    workspace={ReferenceWorkspaceId}
                    filter={newNegativeAttributeFilter(ReferenceMd.Product.Name, [])}
                    onApply={action("on-apply")}
                />
            </div>
        );
    })
    .add("Default component with selection in title", () => {
        return (
            <div style={wrapperStyle} className="screenshot-target">
                <AttributeFilterBase
                    backend={backend}
                    workspace={ReferenceWorkspaceId}
                    filter={newNegativeAttributeFilter(ReferenceMd.Product.Name, [])}
                    onApply={action("on-apply")}
                    FilterButton={AttributeFilterSimpleButtonWithSelection}
                />
            </div>
        );
    })
    .add("AttributeFilterButton", () => {
        return (
            <div style={wrapperStyle} className="screenshot-target">
                <AttributeFilterBase
                    backend={backend}
                    workspace={ReferenceWorkspaceId}
                    filter={newNegativeAttributeFilter(ReferenceMd.Product.Name, [])}
                    onApply={action("on-apply")}
                    FilterButton={AttributeFilterButton}
                />
            </div>
        );
    })
    .add("Custom component", () => {
        return (
            <div style={wrapperStyle} className="screenshot-target">
                <AttributeFilterBase
                    backend={backend}
                    workspace={ReferenceWorkspaceId}
                    filter={newNegativeAttributeFilter(ReferenceMd.Product.Name, [])}
                    onApply={action("on-apply")}
                    FilterButton={CustomComponent}
                />
            </div>
        );
    });
