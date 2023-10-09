import { format, subMinutes } from 'date-fns';

export default interface Filters {
    StartTime: string;
    EndTime: string | null;
    SourceIps: string[] | null;
    DestinationIps: string[] | null;
    Protocols: string[] | null;
}

export const defaultFilters: Filters = {
    StartTime: format(subMinutes(new Date(), 5), "yyyy-MM-dd'T'HH:mm:ss"),
    EndTime: null,
    SourceIps: null,
    DestinationIps: null,
    Protocols: null,
};