// (C) 2021 GoodData Corporation

import { useContext } from "react";
import { MessageDescriptor, useIntl } from "react-intl";
import { ToastMessageContext } from "./ToastMessageContext";
import { MessageType } from "./typings";

/**
 * @public
 */
export type AddMessageType = (message: MessageDescriptor) => void;

/**
 * @public
 */
export interface UseToastMessageType {
    addSuccess: AddMessageType;
    addProgress: AddMessageType;
    addWarning: AddMessageType;
    addError: AddMessageType;
}

/**
 * @public
 */
export const useToastMessage = (): UseToastMessageType => {
    const { addMessage } = useContext(ToastMessageContext);
    const intl = useIntl();

    const addMessageBase = (type: MessageType) => (message: MessageDescriptor) => {
        addMessage({ type, text: intl.formatMessage(message) });
    };

    const addSuccess = addMessageBase("success");
    const addProgress = addMessageBase("progress");
    const addWarning = addMessageBase("warning");
    const addError = addMessageBase("error");

    return {
        addSuccess,
        addProgress,
        addWarning,
        addError,
    };
};
