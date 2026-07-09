using System.Security.Cryptography;
using System.Text;

var stringKey = "~m4MaN9@K4lB3Nutr!tI0n@l5~";
Console.WriteLine("UTF8  " + Convert.ToHexString(Encoding.UTF8.GetBytes(stringKey)));
Console.WriteLine("UNI   " + Convert.ToHexString(Encoding.Unicode.GetBytes(stringKey)));
var Salt = Encoding.ASCII.GetBytes(stringKey.Length.ToString());
Console.WriteLine("SALT  " + Convert.ToHexString(Salt));

var SecretKey = new PasswordDeriveBytes(stringKey, Salt);
Console.WriteLine("KEY " + Convert.ToHexString(SecretKey.GetBytes(32)));
Console.WriteLine("IV  " + Convert.ToHexString(SecretKey.GetBytes(16)));

Console.WriteLine(Convert.ToBase64String(
    new RijndaelManaged().CreateEncryptor(SecretKey.GetBytes(32), SecretKey.GetBytes(16))
        .TransformFinalBlock(Encoding.Unicode.GetBytes("1"), 0, 2)));
