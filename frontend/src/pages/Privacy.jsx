import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import usePageTitle from "../hooks/usePageTitle.js";
import { renderMarkdown } from "../lib/markdown.js";

const PRIVACY_CONTENT = `# POLÍTICA DE PRIVACIDAD DE LIBREINMUEBLES

**Última actualización:** Octubre de 2026

## 1. Responsable del Tratamiento

Alesio Andrés Vieira Nogueira (CUIL 20-43.275.996-3), con domicilio en 5ta Sección Ombucito, Chacra 155, Paso de los Libres, Corrientes, es responsable del tratamiento de los datos personales de los usuarios de LibreInmuebles, disponible en https://libres-inmuebles.vercel.app/.

## 2. Alcance

Esta Política de Privacidad describe cómo recopilamos, utilizamos, almacenamos y protegemos sus datos personales, conforme a lo dispuesto en la **Ley N° 25.326 de Protección de los Datos Personales** (República Argentina), sus normas complementarias y principios generales aplicables.

## 3. Datos Personales que Recopilamos

Al utilizar la Plataforma, podemos recopilar los siguientes datos:

### 3.1. Datos de registro
- Nombre y apellido
- Correo electrónico
- Teléfono (opcional)
- Rol (Buscador o Propietario)
- Contraseña (almacenada exclusivamente con algoritmo de hash, no en texto plano)

### 3.2. Datos de publicaciones
- Título, descripción, operación, tipo, barrio/ubicación, precio, moneda, características (dormitorios, baños, superficie, expensas)
- Servicios, estado de la publicación
- Fotografías del inmueble
- Datos de contacto habilitados para mostrar

### 3.3. Datos de comunicaciones
- Consultas, respuestas y mensajes enviados a través de "Mis mensajes"
- Reportes de publicaciones y sus detalles

### 3.4. Datos técnicos y de uso
- Dirección IP
- Tipo de navegador (User-Agent)
- Páginas visitadas, fecha/hora de acceso
- Información sobre el dispositivo utilizado
- Logs técnicos para diagnóstico, seguridad y prevención de abusos

## 4. Finalidad del Tratamiento

Tratamos sus datos personales con las siguientes finalidades:

1. **Prestación del servicio**: gestionar su cuenta, autenticarlo, habilitar funcionalidades y mantener el funcionamiento de la Plataforma.
2. **Publicación y contacto**: permitir la publicación de inmuebles y facilitar el contacto directo entre usuarios, únicamente en el marco de las funcionalidades habilitadas.
3. **Comunicaciones**: gestionar consultas, mensajes, reportes y responder solicitudes de soporte.
4. **Seguridad y prevención de abusos**: detectar, investigar y prevenir fraudes, spam, accesos no autorizados, vulneraciones a los Términos y Condiciones o actividades ilícitas.
5. **Mejora del servicio**: analizar el uso técnico (de forma agregada o anonimizada) para detectar errores y optimizar el rendimiento.
6. **Cumplimiento legal**: cumplir con obligaciones legales, requerimientos de autoridades competentes o preservar derechos del Titular.

## 5. Base Legal

El tratamiento de sus datos se funda en:
- **Consentimiento informado**: otorgado al registrarse, marcar el consentimiento en el formulario de registro y aceptar estos Términos/Política.
- **Ejecución de contrato**: necesario para prestar el servicio solicitado (gestión de cuenta y funcionalidades).
- **Interés legítimo**: para garantizar seguridad, prevenir abusos y mantener la integridad de la Plataforma, siempre respetando sus derechos fundamentales.

## 6. Comunicación y Divulgación a Terceros

### 6.1. Entre usuarios
Los datos de contacto del Propietario (correo electrónico, teléfono y/o WhatsApp, según lo habilitado) **solo se muestran a Usuarios Registrados** que acceden a la ficha de la propiedad o participan en el hilo de mensajes, con la única finalidad de facilitar el contacto directo legítimo.

### 6.2. Proveedores de servicios (Encargados de Tratamiento)
Para el correcto funcionamiento de la Plataforma, utilizamos proveedores de terceros que pueden procesar datos personales en nuestro nombre:

- **Vercel Inc.** — Hospedaje/Frontend (SPA). Logs de acceso y solicitudes HTTP (mínimos técnicos).
- **Render Inc.** — API/Backend. Solicitudes, logs de aplicación y datos necesarios para procesar peticiones.
- **Supabase Inc.** — Base de datos y almacenamiento (Storage). Datos de usuarios, publicaciones, mensajes, reportes y fotografías cargadas.

Estos proveedores actúan como **encargados de tratamiento**, con cláusulas contractuales que garantizan seguridad y cumplimiento de normas aplicables.

### 6.3. Otras cesiones
No venderemos, alquilaremos ni intercambiaremos sus datos personales con fines comerciales. Solo podremos comunicar sus datos a terceros cuando:
- Sea necesario para proteger derechos, propiedad o seguridad del Titular o de terceros.
- Exista requerimiento fundado y escrito de autoridad judicial o administrativa competente, conforme a la legislación vigente.
- Sea estrictamente necesario para dar cumplimiento a obligaciones legales imperativas.

## 7. Almacenamiento, Conservación y Seguridad

### 7.1. Conservación
Sus datos personales se conservarán:
- **Mientras su cuenta se encuentre activa**.
- **Hasta que solicite su baja**, salvo que deban conservarse por un plazo mayor para cumplir obligaciones legales, resolver disputas, hacer cumplir los Términos y Condiciones, o para atender reclamos o responsabilidades pendientes.

### 7.2. Seguridad
El Titular adopta medidas razonables de seguridad técnica y organizativa (controles de acceso, cifrado en tránsito, buenas prácticas de desarrollo, restricciones de acceso a datos) para proteger sus datos personales contra pérdida, acceso no autorizado, alteración o divulgación indebida.

**Importante**: Ningún sistema de transmisión o almacenamiento en Internet es 100% seguro. En consecuencia, no podemos garantizar una seguridad absoluta. El Usuario comparte su información bajo su propia responsabilidad y debe mantener sus credenciales en estricta confidencialidad.

### 7.3. Ubicación
Los datos pueden ser almacenados o procesados en servidores ubicados fuera de Argentina, por parte de los proveedores listados en el punto 6.2. En dichos casos, nos aseguramos de que cuenten con garantías adecuadas para la protección de sus datos personales.

## 8. Derechos del Titular de los Datos Personales

Conforme a lo establecido en la **Ley N° 25.326 de Protección de los Datos Personales**, usted tiene derecho a:

- **Acceso**: solicitar información sobre si tratamos sus datos y obtener una copia de los mismos.
- **Rectificación**: solicitar la corrección o actualización de datos inexactos, erróneos o incompletos.
- **Actualización**: solicitar que sus datos sean mantenidos actualizados.
- **Supresión (baja)**: solicitar la eliminación o anonimización de sus datos, cuando ello no esté impedido por obligación legal o motivo legítimo para conservarlos.
- **Bloqueo**: solicitar el bloqueo de sus datos cuando considere que el tratamiento es indebido o mientras se resuelve una solicitud.
- **Oposición**: oponerse al tratamiento de sus datos en los casos legalmente previstos.

## 9. Ejercicio de Derechos

Para ejercer cualquiera de estos derechos, envíe una solicitud **por escrito** a soportelibreinmuebles@gmail.com, incluyendo:

1. **Nombre y apellido completos**.
2. **Correo electrónico** con el que se registró en la Plataforma (o medio idóneo para verificar identidad).
3. **Descripción clara y precisa** del derecho que desea ejercer.
4. **Datos o alcance** sobre los que solicita el ejercicio (para facilitar la respuesta).

El Titular responderá su solicitud dentro de un plazo razonable, conforme a lo establecido en la normativa aplicable. En caso de ser necesario, podrá solicitar información adicional para verificar su identidad y proteger sus datos.

## 10. Cookies y Tecnologías Similares

La Plataforma puede utilizar **cookies técnicas o de sesión** estrictamente necesarias para su correcto funcionamiento (autenticación, mantenimiento de sesión). **No se utilizan cookies de publicidad, seguimiento o análisis de terceros** en la versión actual.

Si en el futuro se implementaran, se actualizará esta Política y, cuando corresponda, se solicitará el consentimiento adecuado.

## 11. Menores de Edad

LibreInmuebles no está dirigida a menores de 18 años. No recopilamos intencionalmente datos personales de menores de edad. Si toma conocimiento de que un menor de 18 años nos ha proporcionado datos personales, le solicitamos que nos lo notifique a soportelibreinmuebles@gmail.com para proceder a su eliminación, cuando sea técnicamente posible.

## 12. Transferencias Internacionales

Al utilizar proveedores ubicados fuera de Argentina (punto 6.2), sus datos pueden ser transferidos a jurisdicciones con distintos niveles de protección. Adoptamos las medidas razonables para que dichos proveedores brinden garantías adecuadas de protección, conforme a la Ley 25.326 y buenas prácticas internacionales.

## 13. Modificación de la Política de Privacidad

El Titular se reserva el derecho a **modificar, actualizar o revisar esta Política de Privacidad** en cualquier momento, a su exclusivo criterio.

Las modificaciones entrarán en vigor desde su publicación en el Sitio, actualizando la fecha de **"Última actualización"**. Se recomienda al Usuario **revisar periódicamente** esta Política.

El uso continuado de la Plataforma después de la entrada en vigor de las modificaciones implicará la **aceptación tácita** de la Política modificada.

## 14. Contacto

Para consultas, dudas, reclamos, notificaciones o ejercicio de derechos sobre sus datos personales, puede dirigirse a:

**Correo electrónico:** soportelibreinmuebles@gmail.com

**Responsable del Tratamiento:** Alesio Andrés Vieira Nogueira
Domicilio: 5ta Sección Ombucito, Chacra 155, Paso de los Libres, Corrientes
CUIL: 20-43.275.996-3`;

export default function Privacy() {
  usePageTitle("Política de Privacidad");
  const [content, setContent] = useState("");

  useEffect(() => {
    setContent(renderMarkdown(PRIVACY_CONTENT));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 shadow-sm">
        <div className="prose prose-sm max-w-none prose-headings:text-brand-900 prose-a:text-brand-600">
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
        <div className="mt-6 text-center">
          <Link to="/terminos" className="text-brand-600 hover:underline text-sm">
            ← Volver a Términos y Condiciones
          </Link>
        </div>
      </div>
    </div>
  );
}
