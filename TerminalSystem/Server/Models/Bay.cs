namespace Server.Models
{
    public class Bay : YardLocation
    {
        public int BayNumber { get; set; }
        public bool IsGreenLane { get; set; }
    }
}
