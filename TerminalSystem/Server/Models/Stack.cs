namespace Server.Models
{
    public class Stack : YardLocation
    {
        public string StackLetter { get; set; } = string.Empty;
        public int CurrentTier { get; set; }
    }
}
