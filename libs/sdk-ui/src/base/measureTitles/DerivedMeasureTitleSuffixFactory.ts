// (C) 2007-2022 GoodData Corporation
import { getTranslation } from "../localization/IntlStore";
import { OverTimeComparisonType, OverTimeComparisonTypes } from "../interfaces/OverTimeComparison";
import { ILocale } from "../localization/Locale";
import { messages } from "../../locales";
/**
 * Factory that builds formatted localized suffix string for derived measure based on the over time comparison type.
 * The suffix is used during AFM execution and for bucket item titles.
 *
 * @internal
 */
export class DerivedMeasureTitleSuffixFactory {
    private readonly locale: ILocale;

    /**
     * Create a new instance of the class.
     * @param locale - The locale used for translation.
     */
    constructor(locale: ILocale) {
        this.locale = locale;
    }

    /**
     * Returns formatted localized suffix string for derived measure based on the over time comparison type.
     * In case when unsupported over time comparison type is provided the empty string is returned.
     *
     * @param overTimeComparisonType - The over time comparison type for which the
     *      suffix must be obtained.
     * @returns localized suffix
     */
    public getSuffix(overTimeComparisonType: OverTimeComparisonType): string {
        const localizationKey = this.getSuffixLocalizationKey(overTimeComparisonType);
        return localizationKey === null ? "" : ` - ${this.translateKey(localizationKey)}`;
    }

    private getSuffixLocalizationKey(overTimeComparisonType: OverTimeComparisonType): { id: string } | null {
        switch (overTimeComparisonType) {
            case OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR:
                return messages.samePeriodYearAgo;
            case OverTimeComparisonTypes.PREVIOUS_PERIOD:
                return messages.previousPeriod;
            default:
                return null;
        }
    }

    private translateKey(localizationKey: { id: string }): string {
        return getTranslation(localizationKey, this.locale);
    }
}
