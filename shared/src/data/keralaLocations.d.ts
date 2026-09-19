export interface Ward {
    id: string;
    name: string;
}
export interface LocalBody {
    id: string;
    name: string;
    type: "panchayat" | "municipality" | "corporation";
    wards: Ward[];
}
export interface Taluk {
    id: string;
    name: string;
    localBodies: LocalBody[];
}
export interface District {
    id: string;
    name: string;
    taluks: Taluk[];
}
export declare const KERALA_DISTRICTS: District[];
export declare function findDistrict(districtId: string): District | undefined;
export declare function findTaluk(talukId: string): Taluk | undefined;
export declare function findLocalBody(localBodyId: string): LocalBody | undefined;
export declare const getDistricts: () => {
    id: string;
    name: string;
}[];
export declare const getTaluks: (districtId: string) => {
    id: string;
    name: string;
}[];
export declare const getLocalBodies: (talukId: string) => {
    id: string;
    name: string;
    type: "corporation" | "municipality" | "panchayat";
}[];
export declare const getWards: (localBodyId: string) => Ward[];
export declare const getDistrictName: (id: string) => string;
export declare const getTalukName: (talukId: string) => string;
//# sourceMappingURL=keralaLocations.d.ts.map