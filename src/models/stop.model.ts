export class Stop {
  StopId: number;
  StopRecordId: number;
  Name: string;
  Description: string;
  Latitude: number;
  Longitude: number;
  IsTimePoint: boolean;
  Liked: boolean;
  Distance: number;
  constructor(StopId: number, StopRecordId: number, Name: string, Description: string,
    Latitude: number, Longitude: number, IsTimePoint: boolean, Liked: boolean,
    Distance: number) {
      this.StopId = StopId;
      this.StopRecordId = StopRecordId;
      this.Name = Name;
      this.Description = Description;
      this.Latitude = Latitude;
      this.Longitude = Longitude;
      this.IsTimePoint = IsTimePoint;
      this.Liked = Liked;
      this.Distance = Distance;
  }
}
