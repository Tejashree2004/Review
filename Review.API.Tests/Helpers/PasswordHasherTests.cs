using Review.API.Helpers;

namespace Review.API.Tests.Helpers;

public class PasswordHasherTests
{
    [Fact]
    public void HashPassword_ShouldReturnHashedPassword()
    {
        var password = "Test@123";

        var hash = PasswordHasher.HashPassword(password);

        Assert.False(string.IsNullOrWhiteSpace(hash));
        Assert.NotEqual(password, hash);
    }

    [Fact]
    public void VerifyPassword_ShouldReturnTrue_ForCorrectPassword()
    {
        var password = "Test@123";

        var hash = PasswordHasher.HashPassword(password);

        var result = PasswordHasher.VerifyPassword(password, hash);

        Assert.True(result);
    }

    [Fact]
    public void VerifyPassword_ShouldReturnFalse_ForWrongPassword()
    {
        var password = "Test@123";
        var wrongPassword = "Wrong@123";

        var hash = PasswordHasher.HashPassword(password);

        var result = PasswordHasher.VerifyPassword(wrongPassword, hash);

        Assert.False(result);
    }
}
