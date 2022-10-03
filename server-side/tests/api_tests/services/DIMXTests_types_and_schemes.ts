import { SchemeField } from "@pepperi-addons/papi-sdk";

export const MAX_CONCURRENCY = 5;

export const BASE_SCHEMA_NAME = "TestingBaseSchema";
export const SECOND_BASE_SCHEMA_NAME = "TestingSecondBaseSchema";
export const HOST_SCHEMA_NAME = "TestingHostSchema";
export const REFERENCE_SCHEMA_NAME = "TestingReferenceSchema"
export const CONTAINED_SCHEMA_NAME = "TestingContainedSchema"
export const DIMX_ADDON_UUID = "44c97115-6d14-4626-91dc-83f176e9a0fc";

// all of the following types should eventually go into the SDK probably
interface BaseResourceObject {
    URI: string;
    AddonUUID: string;
    Resource: string;
    Version?: string;
}

interface ResourceObjectForImport extends BaseResourceObject {
    OverwriteObject?: boolean;
    OverwriteTable?: boolean;
}

export type FileExportOutput = {
    URI: string;
    Version: string | undefined;
    DistributorUUID: any;
}

export type FileImportOutput = {
    URI: string;
}

export type RecursiveExportOutput = {
    URI: string;
    Resources: BaseResourceObject[];
}

export type MappingObject = { [key: string]: { "Action": "Ask" | "Replace", "NewKey": string } };

export type CreateMappingInput = RecursiveExportOutput;

export type CreateMappingOutput = {
    Mapping: {
        [addonUUID_resource: string]: MappingObject;
    };
}

export type RecursiveImportOutput = {
    URI: string;
    Resources: BaseResourceObject[];
}



export const baseSchema: {
    [key: string]: SchemeField;
} | undefined = {
    StringProperty: { Type: "String" },
    NumberProperty: { Type: "Integer" },
    BoolProperty: { Type: "Bool" },
    ObjectProperty: {
        Type: "Object",
        Fields: {
            InnerProperty: { Type: "String" }
        }
    },
    ArrayProperty: { Type: "Array", Items: { Type: "String" } },
    IsCurrentlyImporting: { Type: "Bool" }
}

export const hostSchema: {
    [key: string]: SchemeField;
} | undefined =
{
    StaticReference: {
        Type: "Resource",
        AddonUUID: DIMX_ADDON_UUID,
        Resource: REFERENCE_SCHEMA_NAME
    },
    IsCurrentlyImporting: { Type: "Bool" }
}

export const referenceSchema: {
    [key: string]: SchemeField;
} | undefined =
{
    DynamicContainedArray: {
        Type: "Array",
        Items: {
            Type: "ContainedDynamicResource"
        }
    },
    IsCurrentlyImporting: { Type: "Bool" }
}

export const containedSchema: {
    [key: string]: SchemeField;
} | undefined =
{
    DynamicReference: { Type: "DynamicResource" },
    StringProperty: { Type: "String" }
}

export type BaseTableObject = {
    Key: string,
    StringProperty: string,
    NumberProperty: number,
    BoolProperty: boolean,
    ObjectProperty: {
        InnerProperty: string
    },
    ArrayProperty: string[],
    IsCurrentlyImporting: boolean
}

export type HostTableObject = {
    Key: string,
    StaticReference: string,
    IsCurrentlyImporting: boolean
}

export type ReferenceTableObject = {
    Key: string,
    DynamicContainedArray: {
        Resource: string,
        AddonUUID: string,
        Data: any
    }[]
    IsCurrentlyImporting: boolean
}

export type ContainedTableObject = {
    Key: string,
    DynamicReference: {
        Resource: string,
        AddonUUID: string,
        Key: string
    },
    StringProperty: string
}