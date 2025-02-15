// (C) 2022 GoodData Corporation
import React, { useCallback, useMemo } from "react";
import cx from "classnames";

import { ObjRef } from "@gooddata/sdk-model";
import { ParentFiltersDisabledItem } from "./ParentFiltersDisabledItem";
import { stringUtils } from "@gooddata/util";
import { FormattedMessage } from "react-intl";
import {
    useDashboardSelector,
    IDashboardAttributeFilterParentItem,
    selectIsCircularDependency,
    selectConnectingAttributesForFilters,
} from "../../../../../../model";
import { ConnectingAttributeDropdown } from "../connectingAttribute/ConnectingAttributeDropdown";

export interface IConfigurationParentItem {
    localId: string;
    displayForm: ObjRef;
    isSelected: boolean;
}

export interface IConfigurationParentItemProps {
    currentFilterLocalId: string;
    item: IDashboardAttributeFilterParentItem;
    onClick: (localId: string, isSelected: boolean, overAttributes: ObjRef[]) => void;
    onConnectingAttributeSelect: (localIdentifier: string, targetRef: ObjRef) => void;
}

export const ParentFiltersListItem: React.FC<IConfigurationParentItemProps> = (props) => {
    const {
        item: { isSelected, localIdentifier, title, selectedConnectingAttribute },
        onClick,
        currentFilterLocalId,
        onConnectingAttributeSelect,
    } = props;

    const isCircularDependency = useDashboardSelector(
        selectIsCircularDependency(currentFilterLocalId, localIdentifier),
    );
    const connectingAttributes = useDashboardSelector(
        selectConnectingAttributesForFilters(currentFilterLocalId, localIdentifier),
    );

    const showConnectingAttributeSelect = isSelected && connectingAttributes.length > 1;
    const isDisabled = isCircularDependency || !connectingAttributes.length;

    const activeItemClasses = useMemo(() => {
        return cx(
            "gd-list-item attribute-filter-item s-attribute-filter-dropdown-configuration-item",
            `s-${stringUtils.simplifyText(title)}`,
            {
                "is-selected": isSelected,
            },
        );
    }, [isSelected, title]);

    const onSelect = useCallback(() => {
        onClick(
            localIdentifier,
            !isSelected,
            connectingAttributes.map((attr) => attr.ref),
        );
    }, [isSelected, localIdentifier, onClick, connectingAttributes]);

    if (isDisabled) {
        return (
            <ParentFiltersDisabledItem
                hasConnectingAttributes={!!connectingAttributes.length}
                itemTitle={title}
                itemLocalId={currentFilterLocalId}
            />
        );
    }

    return (
        <React.Fragment>
            <div className={activeItemClasses} onClick={onSelect} title={title}>
                <label className="input-checkbox-label configuration-item-title">
                    <input
                        type="checkbox"
                        className="input-checkbox s-checkbox"
                        checked={isSelected}
                        readOnly
                    />
                    <span className="input-label-text">{title}</span>
                    {showConnectingAttributeSelect && (
                        <span className="addon">
                            &nbsp;
                            <FormattedMessage id="attributesDropdown.attributeNameWithData" />
                        </span>
                    )}
                </label>
            </div>
            {showConnectingAttributeSelect && (
                <ConnectingAttributeDropdown
                    itemLocalId={localIdentifier}
                    connectingAttributes={connectingAttributes}
                    selectedConnectingAttributeRef={selectedConnectingAttribute}
                    onSelect={onConnectingAttributeSelect}
                />
            )}
        </React.Fragment>
    );
};
