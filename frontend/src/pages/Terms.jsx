import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import usePageTitle from "../hooks/usePageTitle.js";
import { renderMarkdown } from "../lib/markdown.js";

const TERMS_CONTENT = `# TÉRMINOS Y CONDICIONES DE USO DE LIBREINMUEBLES

**Última actualización:** Octubre de 2026

## 1. Aceptación de los Términos

Al acceder, registrarse, utilizar o navegar en la plataforma LibreInmuebles (en adelante, "la Plataforma"), disponible en https://libres-inmuebles.vercel.app/ (en adelante, "el Sitio"), el usuario declara haber leído, comprendido y aceptado íntegramente estos Términos y Condiciones de Uso (en adelante, "los Términos").

Si no está de acuerdo con alguna de las cláusulas, debe abstenerse de utilizar la Plataforma.

## 2. Identificación del Titular

La Plataforma es gestionada por Alesio Andrés Vieira Nogueira, con domicilio en 5ta Sección Ombucito, Chacra 155, Paso de los Libres, Corrientes, CUIL 20-43.275.996-3, correo electrónico de contacto: soportelibreinmuebles@gmail.com.

## 3. Definiciones

- **Plataforma**: Sitio web LibreInmuebles, sus funcionalidades, servicios y contenidos.
- **Usuario**: Toda persona física que acceda, navegue, se registre o utilice la Plataforma, indistintamente de su rol.
- **Buscador**: Usuario registrado interesado en buscar, consultar o contactar respecto de inmuebles publicados.
- **Propietario**: Usuario registrado que publica inmuebles de su propiedad directa con el fin de ofrecerlos.
- **Publicación**: Anuncio de inmueble cargado por un Propietario en la Plataforma.
- **Consulta/Mensaje**: Comunicación entre usuarios a través de la sección "Mis mensajes".
- **Reporte**: Denuncia realizada por un usuario sobre una publicación, conforme a los motivos disponibles.
- **Contenido**: Textos, fotografías, descripciones, datos, información, comentarios u otro material cargado por usuarios o generado por la Plataforma.

## 4. Objeto y Naturaleza del Servicio

LibreInmuebles es una plataforma tecnológica que tiene por objeto conectar, de manera directa, a propietarios de inmuebles con personas interesadas en alquilar o comprar.

**Importante**: LibreInmuebles **NO es una inmobiliaria, corredor, martillero, agente inmobiliario, intermediario comercial ni prestador de servicios de corretaje**. No participa en la negociación, celebración, perfeccionamiento o ejecución de contratos de alquiler, compra-venta, depósito o cualquier otro acto jurídico entre usuarios.

La Plataforma se limita a poner a disposición un espacio para la publicación y consulta de inmuebles, facilitando el contacto directo entre usuarios.

## 5. Alcance Territorial

La Plataforma está orientada, principalmente, a inmuebles ubicados en **Paso de los Libres, Provincia de Corrientes, República Argentina**. No obstante, el titular podrá ampliar o modificar este alcance en cualquier momento, sin previo aviso.

## 6. Registro, Cuentas de Usuario y Roles

### 6.1. Registro
Para acceder a ciertas funcionalidades (enviar consultas, responder mensajes, publicar inmuebles, reportar publicaciones) es necesario registrarse, proporcionando información veraz, completa y actualizada.

### 6.2. Responsabilidad de la cuenta
El usuario es el único responsable de:
- Mantener la confidencialidad de su contraseña y credenciales.
- Todas las actividades realizadas bajo su cuenta.
- Notificar de inmediato al Titular, a través de soportelibreinmuebles@gmail.com, cualquier uso no autorizado o sospecha de acceso indebido.

### 6.3. Veracidad de datos
El Usuario garantiza que los datos personales y de contacto proporcionados son correctos, actuales y le pertenecen. Está prohibido utilizar datos falsos, de terceros sin autorización o suplantar identidades.

### 6.4. Roles
Al registrarse, el usuario podrá elegir el rol de **Buscador** o **Propietario**. El titular podrá, a su exclusivo criterio, solicitar comprobación o restringir funcionalidades si detecta un uso indebido del rol seleccionado.

### 6.5. Edad mínima
Para utilizar la Plataforma se requiere ser mayor de 18 años o contar con capacidad legal para contratar, conforme a la legislación argentina vigente.

## 7. Publicaciones de Inmuebles (Obligaciones del Propietario)

### 7.1. Propiedad directa
El Usuario que publique un inmueble como **Propietario** declara y garantiza, bajo su exclusiva responsabilidad, que **es dueño directo del inmueble** que publica, o que cuenta con autorización legítima e idónea para ofrecerlo en la Plataforma.

**Queda terminantemente prohibido** publicar inmuebles en calidad de intermediario, corredor, inmobiliaria o persona que no sea propietario directo. Esta conducta podrá dar lugar a la baja inmediata de la publicación, suspensión o cancelación de la cuenta, sin perjuicio de las responsabilidades legales que correspondan.

### 7.2. Veracidad y exactitud
El Propietario se obliga a que toda la información de la publicación (título, descripción, operación, tipo, ubicación, precio, características, servicios, estado, fotos, datos de contacto) sea **veraz, completa, exacta y actualizada**.

### 7.3. Fotos
Las fotografías deben corresponder **exclusivamente al inmueble publicado**. Queda prohibido subir imágenes que infrinjan derechos de terceros, contengan información sensible no autorizada, sean engañosas o no representen la realidad del inmueble.

### 7.4. Actualización del estado
El Propietario es responsable de **mantener actualizado el estado de sus publicaciones** (Disponible, En negociación o Finalizada). Debe dar de baja o marcar como finalizada aquella publicación que ya no esté disponible, a fin de evitar consultas innecesarias.

### 7.5. Responsabilidad exclusiva del contenido publicado
**El usuario es el único y exclusivo responsable del contenido que carga, publica o transmite en la Plataforma.** El Titular no verifica, avala ni garantiza la veracidad, exactitud, legalidad o disponibilidad real de los inmuebles publicados.

## 8. Uso Prohibido

Queda expresamente prohibido utilizar la Plataforma para:

1. Publicar, transmitir o compartir contenido falso, engañoso, difamatorio, calumnioso, abusivo, obsceno, discriminatorio, xenófobo, violento o ilegal.
2. Publicar inmuebles como intermediario (violando el apartado 7.1).
3. Suplantar a otra persona o entidad, o falsear datos de identidad.
4. Enviar spam, publicidad no autorizada, cadenas, correo masivo o solicitudes automatizadas.
5. Recabar, solicitar o divulgar datos personales sensibles de otros usuarios fuera del marco estrictamente necesario para el contacto directo derivado de una consulta legítima.
6. Cargar contenido que infrinja derechos de autor, marcas, imagen, honor, privacidad u otros derechos de terceros.
7. Introducir virus, malware, scripts, bots o cualquier tecnología que pueda dañar, sobrecargar, interferir o comprometer el funcionamiento de la Plataforma.
8. Extraer, scrapear, copiar masivamente o reutilizar el contenido de la Plataforma con fines comerciales no autorizados.
9. Utilizar la Plataforma para realizar actividades ilícitas o contrarias a la moral y buenas costumbres.
10. Eludir, burlar o intentar vulnerar medidas de seguridad, restricciones o moderación de la Plataforma.

## 9. Consultas, Mensajes, Reportes y Comunicación

### 9.1. Canal de contacto directo
Las consultas enviadas a través de "Preguntar al dueño" o "Mis mensajes" tienen como finalidad facilitar el contacto directo entre usuarios. LibreInmuebles no interviene en el contenido, tono, respuesta o resultado de dichas comunicaciones.

### 9.2. Uso responsable
Los usuarios se comprometen a utilizar el sistema de mensajes de forma cordial, respetuosa y con fines legítimos relacionados con la consulta del inmueble. Queda prohibido el uso abusivo, ofensivo, discriminatorio o con fines comerciales ajenos a la publicación.

### 9.3. Reportes
Cualquier usuario logueado puede reportar publicaciones mediante los motivos habilitados (spam, intermediario, datos falsos, duplicada u otro). Los reportes son revisados por el equipo de moderación a los efectos de verificar posibles infracciones a estos Términos. El envío de un reporte no implica obligación de resolución en plazo determinado, aunque se procurará su revisión con la debida diligencia.

### 9.4. Enlaces a WhatsApp/Email
La Plataforma ofrece enlaces para contactar por WhatsApp o correo electrónico a título meramente informativo y de conveniencia. El uso de esos canales queda fuera del ámbito de moderación activa de la Plataforma y se regirá por los términos de dichos servicios de terceros.

## 10. Moderación, Suspensión y Baja de Contenido/Cuentas

### 10.1. Facultad de moderación
El Titular se reserva el derecho, a su único y exclusivo criterio, de revisar, moderar, editar, rechazar, ocultar, eliminar o dar de baja, total o parcialmente, cualquier publicación, mensaje, reporte o cuenta, cuando exista sospecha razonable o constancia de incumplimiento a estos Términos, sin necesidad de aviso previo.

### 10.2. Suspensión o cancelación
El Titular podrá suspender temporalmente o cancelar definitivamente una cuenta de usuario en caso de:
- Incumplimiento reiterado o grave de estos Términos.
- Conducta fraudulenta, abusiva o ilícita.
- Vulneración de derechos de terceros.
- Uso que pueda perjudicar la seguridad, funcionamiento o reputación de la Plataforma.

### 10.3. Efecto inmediato
En casos graves, la medida podrá aplicarse con efecto inmediato. El usuario no tendrá derecho a indemnización alguna por la suspensión o baja dispuesta conforme a esta cláusula.

## 11. Propiedad Intelectual

### 11.1. Derechos sobre la Plataforma
La Plataforma, su estructura, diseño, código fuente, interfaces, logotipo, nombres, marcas, textos, gráficos y demás elementos originales son propiedad del Titular o de sus licenciantes, encontrándose protegidos por leyes de propiedad intelectual de Argentina y tratados internacionales.

### 11.2. Licencia sobre contenido cargado por el Usuario
Al cargar fotos, descripciones u otro contenido en la Plataforma, el Usuario otorga al Titular una licencia no exclusiva, mundial, gratuita, sublicenciable y transferible para utilizar, alojar, reproducir, mostrar, distribuir y poner a disposición dicho contenido únicamente con la finalidad de operar, mantener, promover y mostrar la Plataforma y sus publicaciones.

### 11.3. Responsabilidad sobre derechos de terceros
El Usuario garantiza que posee o ha obtenido todos los derechos necesarios para cargar y licenciar el contenido que publica (incluidas las fotografías), y que dicho contenido no infringe derechos de terceros. En caso de reclamo por infracción, el Usuario asume la plena responsabilidad y se compromete a mantener indemne al Titular.

## 12. Privacidad y Protección de Datos Personales

El tratamiento de los datos personales se rige por la **Política de Privacidad** de LibreInmuebles, disponible en [https://libres-inmuebles.vercel.app/privacidad](https://libres-inmuebles.vercel.app/privacidad).

## 13. Limitación de Responsabilidad

### 13.1. Contenido generado por usuarios
El Titular NO se responsabiliza por el contenido publicado por los usuarios, ni por la veracidad, exactitud, estado de conservación, legalidad, disponibilidad o idoneidad de los inmuebles ofrecidos. Toda información debe ser verificada directamente por el interesado con el Propietario.

### 13.2. Transacciones entre usuarios
LibreInmuebles no interviene, media ni garantiza la concreción, cumplimiento, pago, entrega, calidad, vicios ocultos o cualquier aspecto de la transacción que pudiera derivarse del contacto entre usuarios. El acuerdo, negociación y eventual contrato será exclusiva responsabilidad entre las partes.

### 13.3. Disponibilidad del servicio
El Titular no garantiza que la Plataforma esté disponible de forma ininterrumpida, segura o libre de errores. Se reserva el derecho a suspender, interrumpir o modificar el servicio, total o parcialmente, por mantenimiento, actualización, fuerza mayor u otras causas, sin previo aviso.

### 13.4. Cold Start (arranque en frío)
Se informa que, por características del hosting gratuito (Render Free), la primera solicitud tras un período de inactividad puede demorar 40–60 segundos en responder. Esta demora no constituye un error ni defecto del servicio y no genera responsabilidad para el Titular.

### 13.5. Daños y perjuicios
En la máxima medida permitida por la legislación argentina vigente, el Titular queda eximido de toda responsabilidad por daños directos, indirectos, incidentales, especiales, punitivos o consecuentes, derivados del uso o imposibilidad de uso de la Plataforma, o de las relaciones o transacciones entre usuarios.

## 14. Garantías y Exención

La Plataforma se presta "tal como está" y "según disponibilidad". El Titular no otorga garantías de ningún tipo, expresas o implícitas.

## 15. Indemnización

El Usuario se compromete a indemnizar, defender y mantener indemne al Titular, frente a cualquier reclamo derivado de su incumplimiento a estos Términos, su contenido publicado, comunicaciones o uso indebido de la Plataforma.

## 16. Modificación de los Términos

El Titular se reserva el derecho a modificar estos Términos en cualquier momento. Las modificaciones entrarán en vigor a partir de su publicación en el Sitio, con la fecha de "Última actualización". El uso continuado implica aceptación tácita.

## 17. Ley Aplicable y Jurisdicción

Estos Términos se rigen por las leyes de la República Argentina, con competencia en los Tribunales Ordinarios en lo Civil y Comercial de Paso de los Libres, Provincia de Corrientes, Argentina.

## 18. Contacto

Correo electrónico: soportelibreinmuebles@gmail.com`;

export default function Terms() {
  usePageTitle("Términos y Condiciones");
  const [content, setContent] = useState("");

  useEffect(() => {
    setContent(renderMarkdown(TERMS_CONTENT));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 shadow-sm">
        <div className="prose prose-sm max-w-none prose-headings:text-brand-900 prose-a:text-brand-600">
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
        <div className="mt-6 text-center">
          <Link to="/privacidad" className="text-brand-600 hover:underline text-sm">
            Ver Política de Privacidad →
          </Link>
        </div>
      </div>
    </div>
  );
}
