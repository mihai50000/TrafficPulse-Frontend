import Filters from "./Filters";

export default interface PacketWindow {
    Size: number;
    Start: string;
    End: string;
    Filters: Filters;
}