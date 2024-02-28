using Microsoft.AspNetCore.Mvc;

namespace Prueba1.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class JuegoController : ControllerBase
    {
        private static readonly string[] Jugadas = new[]
         {
            "Piedra", "Papel", "Tijera"
        };

        [HttpGet(Name = "GetJuego")]
        public IEnumerable<string> Get()
        {
            return Jugadas;
        }
    }
}