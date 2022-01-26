declare global {
    namespace Arcaela {
        namespace Bridge {
            /**
             * @description En este Bridge podemos utilizar esta interfaz para manipular o leer los datos que recibimos de la solicitud.
             */
            type RequestInit = globalThis.RequestInit & {
                method?: Arcaela.HTTP.Methods;
            };
            type Request = globalThis.RequestInit & {
                url: string;
                method: Arcaela.HTTP.Methods;
                params: Record<string, any>;
                query: URLSearchParams;
            };
            interface Response {
                headers: globalThis.Headers;
                bridge(executor: Promise<globalThis.Response>): void;
                send(content: BodyInit, code: number): void;
                send(content: BodyInit, options: ResponseInit): void;
            }
            type NextTap = ((action?: "route") => void) | ((error?: Error | string) => void);
            type RequestHandler = (req: Request, res: Response, next: NextTap) => void;
            type Methods = "get" | "head" | "post" | "put" | "delete" | "connect" | "options" | "trace" | "patch";
            type Route = Record<string, {
                [K in Methods]?: RequestHandler[];
            }>;
            type Iterators = RequestHandler[] | RequestHandler[][];
        }
    }
}
declare class Bridge {
    private readonly routes;
    private readonly iterators;
    /**
     * @description Agregar un manejador de solicitud para todas las solicitudes entrantes al Bridge, estos manejadores son ejecutados antes que cualquier consulta externa.
     * @example
     * // Podemos definir los headers cuando recibimos la solicitud.
     * bridge.use((req)=>{
     *  if( !req.headers.has("Authenticate"))
     *      req.headers.set("Authenticate", "Beader myencodeTokenAqui");
     * });
     * // Entonces para leer el header
     * bridge.post("/user/create", async (req, res, next)=>{
     *      // Verificamos que tenga el header
     *      if( !req.headers.has("Authenticate") )
     *          next( new Error("Se requiere autorizacion", 400) );
     *      // Usamos nuestra API privada para validar el token.
     *      else if(! await (aws.verifyToken( req.headers.get("Authenticate") )) )
     *          next("El usuario no existe", 403);
     *      // Validamos los permisos del usuario
     *      else if(! await (await aws.permissions.verify("create")) )
     *          res.status( 400 ).send({ message: "El usuario no tiene este permiso." })
     * });
     */
    use(...Iterators: Arcaela.Bridge.Iterators): this;
    use(path: string, ...Iterators: Arcaela.Bridge.Iterators): this;
    /**
     * @description Esta función crea un bridge para la solicitud, siempre que corresponda al método indicado.
     * @example
     * bridge.get("/news", (req, res)=>{
     *      res.bridge( fetch("https://news.google.com/") );
     * });
     */
    get(path: string, ...iterators: Arcaela.Bridge.Iterators): this;
    head(path: string, ...iterators: Arcaela.Bridge.Iterators): this;
    /**
     * @description Esta función crea un bridge para la solicitud, siempre que corresponda al método indicado.
     * @example
     * bridge.post("/publish", (req, res, next)=>{
     *  if(!req.headers.has("Authenticate")) next("Se requiere un token de sesión");
     *  else next();
     * });
     */
    post(path: string, ...iterators: Arcaela.Bridge.Iterators): this;
    /**
     * @description Esta función crea un bridge para la solicitud, siempre que corresponda al método indicado.
     * @example
     * bridge.put("/update/videos/123",{
     *  body: JSON.stringfy({ title: "Title", content:"Algun texto a enviar" })
     * }).then(res=> res.json());
     */
    put(path: string, ...iterators: Arcaela.Bridge.Iterators): this;
    /**
     * @description Esta función crea un bridge para la solicitud, siempre que corresponda al método indicado.
     * @example
     * bridge.delete("/videos/123").then(res=> res.json());
     */
    delete(path: string, ...iterators: Arcaela.Bridge.Iterators): this;
    connect(path: string, ...iterators: Arcaela.Bridge.Iterators): this;
    options(path: string, ...iterators: Arcaela.Bridge.Iterators): this;
    trace(path: string, ...iterators: Arcaela.Bridge.Iterators): this;
    patch(path: string, ...iterators: Arcaela.Bridge.Iterators): this;
    fetch(url: string, init?: Arcaela.Bridge.RequestInit): Promise<Response>;
}
export default Bridge;
