// (C) 2019-2022 GoodData Corporation
import { BucketNames } from "@gooddata/sdk-ui";
import {
    createSorts,
    getAttributeSortItem,
    getBucketItemIdentifiers,
    getDefaultTreemapSortFromBuckets,
} from "../sort";
import { IExtendedReferencePoint } from "../../interfaces/Visualization";
import * as referencePointMocks from "../../tests/mocks/referencePointMocks";
import { DEFAULT_BASE_CHART_UICONFIG } from "../../constants/uiConfig";
import { SORT_DIR_DESC } from "../../constants/sort";
import {
    insightWithSingleMeasureAndStack,
    insightWithSingleMeasureAndTwoViewBy,
    insightWithSingleMeasureAndViewBy,
    insightWithSingleMeasureAndViewByAndStack,
    insightWithTwoMeasuresAndTwoViewBy,
} from "../../tests/mocks/testMocks";
import {
    IAttributeSortItem,
    IMeasureSortItem,
    ISortItem,
    newAttribute,
    newBucket,
    newMeasure,
} from "@gooddata/sdk-model";

const attributeSort: IAttributeSortItem = {
    attributeSortItem: {
        attributeIdentifier: "a1",
        direction: "asc",
    },
};

const measureSort: IMeasureSortItem = {
    measureSortItem: {
        direction: "asc",
        locators: [
            {
                attributeLocatorItem: {
                    attributeIdentifier: "a1",
                    element: "/gdc/md/PROJECTID/obj/2210/elements?id=1234",
                },
            },
            {
                measureLocatorItem: {
                    measureIdentifier: "m1",
                },
            },
        ],
    },
};

const referencePoint: IExtendedReferencePoint = {
    ...referencePointMocks.multipleMetricBucketsAndCategoryReferencePoint,
    uiConfig: DEFAULT_BASE_CHART_UICONFIG,
    properties: {
        sortItems: [attributeSort, measureSort],
    },
};
// make sure nothing modifies the root object so we can share it between tests
Object.freeze(referencePoint);

describe("createSorts", () => {
    describe("default sorting", () => {
        describe("bar", () => {
            it("should sort by first measure for basic bar chart", () => {
                const expectedSort: ISortItem[] = [
                    {
                        measureSortItem: {
                            direction: "desc",
                            locators: [
                                {
                                    measureLocatorItem: {
                                        measureIdentifier: "m1",
                                    },
                                },
                            ],
                        },
                    },
                ];
                expect(createSorts("bar", insightWithSingleMeasureAndViewBy)).toEqual(expectedSort);
            });
            it("should sort by group for bar chart with 1 measure and 2 viewBy", () => {
                const expectedSort: ISortItem[] = [
                    {
                        attributeSortItem: {
                            direction: "desc",
                            aggregation: "sum",
                            attributeIdentifier: "a1",
                        },
                    },
                    {
                        attributeSortItem: {
                            direction: "desc",
                            aggregation: "sum",
                            attributeIdentifier: "a2",
                        },
                    },
                ];

                expect(createSorts("bar", insightWithSingleMeasureAndTwoViewBy)).toEqual(expectedSort);
            });

            it("should sort by group for bar chart with 2 measure and 2 viewBy", () => {
                const expectedSort: ISortItem[] = [
                    {
                        attributeSortItem: {
                            direction: "desc",
                            aggregation: "sum",
                            attributeIdentifier: "a1",
                        },
                    },
                    {
                        measureSortItem: {
                            direction: "desc",
                            locators: [
                                {
                                    measureLocatorItem: {
                                        measureIdentifier: "m1",
                                    },
                                },
                            ],
                        },
                    },
                ];

                expect(createSorts("bar", insightWithTwoMeasuresAndTwoViewBy)).toEqual(expectedSort);
            });

            it("should sort by group for bar chart with 2 measure and 2 viewBy and canSortStackTotalValue is true", () => {
                const expectedSort: ISortItem[] = [
                    {
                        attributeSortItem: {
                            direction: "desc",
                            aggregation: "sum",
                            attributeIdentifier: "a1",
                        },
                    },
                    {
                        attributeSortItem: {
                            direction: "desc",
                            aggregation: "sum",
                            attributeIdentifier: "a2",
                        },
                    },
                ];

                expect(createSorts("bar", insightWithTwoMeasuresAndTwoViewBy, true)).toEqual(expectedSort);
            });

            it("should return no sort for stacked bar chart with only measure", () => {
                const expectedSort: ISortItem[] = [];
                expect(createSorts("bar", insightWithSingleMeasureAndStack)).toEqual(expectedSort);
            });
        });

        describe("column", () => {
            it("should return empty array", () => {
                expect(createSorts("column", insightWithSingleMeasureAndViewByAndStack)).toEqual([]);
            });
        });

        describe("line", () => {
            it("should return empty array", () => {
                expect(createSorts("line", insightWithSingleMeasureAndViewByAndStack)).toEqual([]);
            });
        });

        describe("pie", () => {
            it("should return empty array", () => {
                expect(createSorts("pie", insightWithSingleMeasureAndViewByAndStack)).toEqual([]);
            });
        });

        describe("table", () => {
            it("should return empty array", () => {
                expect(createSorts("table", insightWithSingleMeasureAndViewByAndStack)).toEqual([]);
            });
        });
    });
});

describe("getBucketItemIdentifiers", () => {
    it("should get all identifiers", () => {
        expect(getBucketItemIdentifiers(referencePoint)).toEqual(["m1", "m2", "m3", "a1"]);
    });
});

describe("getAttributeSortItem", () => {
    it("should return an attribute sort item", () => {
        expect(getAttributeSortItem("a1", SORT_DIR_DESC, true)).toEqual({
            attributeSortItem: { aggregation: "sum", attributeIdentifier: "a1", direction: "desc" },
        });
        expect(getAttributeSortItem("a2")).toEqual({
            attributeSortItem: { attributeIdentifier: "a2", direction: "asc" },
        });
    });
});

describe("getDefaultTreemapSortFromBuckets", () => {
    const measure1 = newMeasure("mid1", (m) => m.localId("m1").alias("Measure m1"));
    const attribute1 = newAttribute("aid1", (a) => a.localId("a1"));
    const attribute2 = newAttribute("aid2", (a) => a.localId("a2"));
    const viewBucket = newBucket(BucketNames.VIEW, attribute1);
    const segmentBucket = newBucket(BucketNames.SEGMENT, attribute2);
    const emptySegmentBucket = newBucket(BucketNames.SEGMENT);

    it("should get empty sort for only a single attribute", () => {
        const sort = getDefaultTreemapSortFromBuckets(viewBucket, emptySegmentBucket, [measure1]);
        expect(sort).toEqual([]);
    });

    it("should get attribute and measure sort if view by and stack by", () => {
        const sort = getDefaultTreemapSortFromBuckets(viewBucket, segmentBucket, [measure1]);
        expect(sort).toEqual([
            {
                attributeSortItem: {
                    direction: "asc",
                    attributeIdentifier: "a1",
                },
            },
            {
                measureSortItem: {
                    direction: "desc",
                    locators: [
                        {
                            measureLocatorItem: {
                                measureIdentifier: "m1",
                            },
                        },
                    ],
                },
            },
        ]);
    });
});
