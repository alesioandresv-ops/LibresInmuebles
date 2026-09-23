from fastapi import APIRouter, Response
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/legal", tags=["legal"])

DISCLAIMER = (
    "MODELO ORIENTATIVO · LibreInmuebles. Este documento es una plantilla de carácter "
    "general e informativo; NO constituye asesoramiento jurídico y no reemplaza la revisión "
    "profesional. Al momento de su uso verifiqué la normativa vigente y, en su caso, "
    "inscribí el contrato conforme la Ley 27.551 y las disposiciones locales "
    "(Paso de los Libres, Corrientes)."
)


def _contract_alquiler_vivienda() -> str:
    return """
<p><strong>PARTES:</strong> [APELLIDO Y NOMBRE DEL LOCADOR], DNI [DOCUMENTO], con domicilio
en [DOMICILIO DEL LOCADOR], en adelante el LOCADOR; y [APELLIDO Y NOMBRE DEL LOCATARIO], DNI
[DOCUMENTO], con domicilio en [DOMICILIO DEL LOCATARIO], en adelante el LOCATARIO, convienen
celebrar el presente contrato de locación de inmueble destinado a vivienda familiar, sujeto a
las siguientes cláusulas:</p>

<p><strong>PRIMERA - OBJETO Y UBICACIÓN:</strong> El LOCADOR da en locación al LOCATARIO el inmueble
ubicado en [DIRECCIÓN COMPLETA], localidad de Paso de los Libres, Corrientes, conforme el plano,
fotografías y anexos que las partes declaran conocer y aceptar.</p>

<p><strong>SEGUNDA - DESTINO:</strong> El inmueble se destinará exclusivamente a vivienda familiar
del LOCATARIO, quien no podrá darle otro uso, sublocarlo ni cederlo total o parcialmente sin
autorización escrita del LOCADOR.</p>

<p><strong>TERCERA - PLAZO:</strong> El plazo de locación es de [X] años, contados desde [FECHA DE
INICIO], venciendo el [FECHA DE FIN]. Por Ley 27.551 el plazo mínimo legal para locaciones de
vivienda es de tres (3) años; plazo menor solo procede en los casos habilitados por la ley.</p>

<p><strong>CUARTA - PRECIO Y FORMA DE PAGO:</strong> El canon mensual será de [MONEDA] [MONTO] (en
letras: [MONTO EN LETRAS]), pagadero por mes anticipado dentro de los primeros [X] días de cada
mes. El precio podrá ajustarse por períodos no inferiores a seis (6) meses, aplicando al valor
vigente el índice que las partes acuerden en el mercado (por ej., ICL - Índice de Contratos de
Locación, o el que fije la autoridad de aplicación), conforme Ley 27.551.</p>

<p><strong>QUINTA - DEPÓSITO EN GARANTÍA:</strong> El LOCATARIO entrega al inicio la suma
equivalente a un mes de alquiler en concepto de depósito en garantía, que será devuelto a la
finalización del contrato, sin intereses, una vez constatado el buen estado del inmueble y pagadas
las deudas pendientes. El depósito será actualizado conforme el índice previsto en la cláusula
cuarta y devuelto bajo las condiciones del art. 12 de la Ley 27.551.</p>

<p><strong>SEXTA - EXPENSAS Y SERVICIOS:</strong> Las expensas y los servicios (agua, luz, gas,
internet, etc.) serán abonados por el LOCATARIO. Si existen expensas extraordinarias, serán
soportadas conforme lo dispuesto por la normativa vigente.</p>

<p><strong>SÉPTIMA - ESTADO Y CONSERVACIÓN:</strong> El LOCATARIO recibe el inmueble en buen estado
según inventario anexo y se obliga a conservarlo. Las reparaciones que exija el desgaste por uso
natural y el mantenimiento (art. 1217 y cctes. del Código Civil y Comercial) quedan a cargo del
LOCADOR; los deterioros originados en culpa del LOCATARIO serán por su cuenta.</p>

<p><strong>OCTAVA - MEJORAS:</strong> El LOCATARIO no podrá realizar mejoras ni modificaciones sin
autorización escrita del LOCADOR. Las mejoras quedan a beneficio del inmueble sin derecho a
reembolso, salvo pacto expreso en contrario.</p>

<p><strong>NOVENA - RESCISIÓN ANTICIPADA:</strong> El LOCATARIO podrá rescindir el contrato
renunciando a la prórroga legal, previo preaviso de tres (3) meses, abonando al LOCADOR la
indemnización y compensaciones que resulten de la normativa aplicable. El LOCADOR podrá resolver el
contrato por incumplimiento del LOCATARIO previa intimación conforme a derecho.</p>

<p><strong>DÉCIMA - RESTITUCIÓN:</strong> A la finalización o resolución del contrato, el LOCATARIO
restituirá el inmueble libre de ocupantes, en el estado pactado y con los servicios al día.</p>

<p><strong>DÉCIMO PRIMERA - DOMICILIOS Y JURISDICCIÓN:</strong> Las partes constituyen domicilios
especiales en los indicados y se someten a los Tribunales Ordinarios de Paso de los Libres,
provincia de Corrientes.</p>

<p><strong>DÉCIMO SEGUNDA - DOCUMENTACIÓN:</strong> El LOCADOR entrega al LOCATARIO la constancia de
inscripción del contrato en el Registro de Locaciones en los plazos legales, conforme Ley 27.551.</p>

<p>En [CIUDAD], a [FECHA]. <br><br>
___________________________ &nbsp;&nbsp;&nbsp; ___________________________<br>
Firma del LOCADOR &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Firma del LOCATARIO</p>
"""


def _contract_alquiler_temporal() -> str:
    return """
<p><strong>PARTES:</strong> [APELLIDO Y NOMBRE DEL LOCADOR], DNI [DOCUMENTO], en adelante el
LOCADOR; y [APELLIDO Y NOMBRE DEL LOCATARIO], DNI [DOCUMENTO], en adelante el LOCATARIO, convienen
la locación temporal del inmueble ubicado en [DIRECCIÓN], Paso de los Libres, Corrientes, con
destino exclusivamente turístico, transitorio o de descanso, conforme las siguientes cláusulas:</p>

<p><strong>PRIMERA - OBJETO Y OCUPACIÓN:</strong> El LOCADOR cede el uso y goce del inmueble al
LOCATARIO y acompañantes detallados (sin perjuicio del cupo admitido por ordenanza local), por el
período comprendido entre [FECHA DE INGRESO] y [FECHA DE EGRESO] (total: [N] diás/noches, [N]
personas).</p>

<p><strong>SEGUNDA - PRECIO:</strong> El valor total acordado es de [MONEDA] [MONTO], abonado de la
siguiente forma: [SEÑA] en concepto de reserva y el saldo a la llegada. La señal pierde valor si el
LOCATARIO no se presenta, salvo fuerza mayor debidamente acreditada.</p>

<p><strong>TERCERA - SERVICIOS:</strong> Los servicios (agua, luz, gas, wifi) están incluidos en el
precio. El consumo excesivo que supere lo razonable conforme el número de huéspedes podrá ser
facturado al LOCATARIO.</p>

<p><strong>CUARTA - CONVIVENCIA Y USO:</strong> El LOCATARIO respetará el reglamento interno, el
descanso de los vecinos y las normas municipales. Queda prohibido realizar fiestas o actividades
que perturben a la comunidad y el tabaquismo si el inmueble lo prohíbe.</p>

<p><strong>QUINTA - DEPÓSITO Y GARANTÍA:</strong> Se constituye un depósito de [MONEDA] [MONTO]
por eventuales daños, reintegrable dentro de los [N] días posteriores al egreso si el inmueble fue
entregado en el mismo estado y sin deudas.</p>

<p><strong>SEXTA - RESPONSABILIDAD Y SEGUROS:</strong> El LOCATARIO responde por los daños causados
por él o sus acompañantes. Se recomienda contratar seguro de responsabilidad civil durante la
estadía.</p>

<p><strong>SÉPTIMA - ENTREGA Y CHECK-OUT:</strong> El ingreso se efectúa [HORA] y el egreso el día de
partida [HORA]. La recepción de llaves se documentará por mensajería o acta simple.</p>

<p>En [CIUDAD], a [FECHA]. <br><br>
___________________________ &nbsp;&nbsp;&nbsp; ___________________________<br>
Firma del LOCADOR &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Firma del LOCATARIO</p>
"""


def _contract_compraventa() -> str:
    return """
<p><strong>COMPROMISO DE COMPRAVENTA / BOLETO:</strong> Entre [APELLIDO Y NOMBRE DEL VENDEDOR], DNI
[DOCUMENTO], en adelante el VENDEDOR; y [APELLIDO Y NOMBRE DEL COMPRADOR], DNI [DOCUMENTO], en
adelante el COMPRADOR, se conviene lo siguiente:</p>

<p><strong>PRIMERA - OBJETO:</strong> El VENDEDOR se obliga a vender y el COMPRADOR a comprar el
inmueble ubicado en [DIRECCIÓN COMPLETA], Paso de los Libres, Corrientes, individualizado según
[PARTIDA/CUENTA/PLANO], libre de deudas, gravámenes, ocupantes y mejoras quiméricas.</p>

<p><strong>SEGUNDA - PRECIO Y FORMA DE PAGO:</strong> El precio total es de [MONEDA] [MONTO].
Forma de pago: [SEÑA] en este acto, [PAGOS PARCIALES] y el saldo al momento de la escrituración
traslativa de dominio contra entrega del inmueble.</p>

<p><strong>TERCERA - TÍTULO:</strong> El VENDEDOR declara ser propietario legítimo y se obliga a
saneamiento (arts. 1033 y cctes. Código Civil y Comercial). La escritura se otorgará en el plazo de
[N] días hábiles desde el cumplimiento de las condiciones precedentes.</p>

<p><strong>CUARTA - GASTOS E IMPUESTOS:</strong> Los tributos municipales, provinciales y nacionales
que graven la transmisión se distribuirán por acuerdo: [DISTRIBUCIÓN]. El COMPRADOR abona las
tasas de verificación de inhibiciones, informes de dominio y deudas.</p>

<p><strong>QUINTA - SEÑA:</strong> Si el COMPRADOR no cumple, pierde la señal conforme al principio
de las arras (art. 1059 CCCN), salvo pacto en contrario. Si el incumplimiento es del VENDEDOR,
deberá restituir la señal duplicada.</p>

<p><strong>SEXTA - DOMINIO / POSE SIÓN:</strong> La entrega de la posesión se producirá a la firma
de la escritura [o en la fecha pactada]. Hasta entonces el VENDEDOR conserva el inmueble bajo su
responsabilidad respecto de terceros.</p>

<p><strong>SÉPTIMA - RESOLUCIÓN:</strong> Queda suspendida la eficacia de este boleto hasta el
pago total; ante mora superior a [N] días podrá resolverse el contrato con los efectos previstos
en la cláusula quinta.</p>

<p><strong>OCTAVA - JURISDICCIÓN:</strong> Las partes se someten a los Tribunales Ordinarios de
Paso de los Libres, Corrientes, constituyendo domicilios especiales en los indicados.</p>

<p>En [CIUDAD], a [FECHA]. <br><br>
___________________________ &nbsp;&nbsp;&nbsp; ___________________________<br>
Firma del VENDEDOR &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Firma del COMPRADOR</p>
"""

TEMPLATES = [
    {
        "slug": "alquiler-vivienda",
        "title": "Contrato de Alquiler de Vivienda (Ley 27.551)",
        "kind": "alquiler_permanente",
        "description": "Locación de vivienda familiar con plazo mínimo legal, ajuste semestral, "
        "depósito en garantía e inscripción en el registro de locaciones.",
        "body": _contract_alquiler_vivienda(),
    },
    {
        "slug": "alquiler-temporal",
        "title": "Contrato de Alquiler Temporal (turístico)",
        "kind": "alquiler_temporal",
        "description": "Cedido por días para turismo o descanso: plazo, precio con seña, depósito y "
        "reglas de convivencia y check-out.",
        "body": _contract_alquiler_temporal(),
    },
    {
        "slug": "compraventa",
        "title": "Boleto / Compromiso de Compraventa",
        "kind": "venta",
        "description": "Acuerdo para la venta de un inmueble urbano: precio, seña, título, gastos y "
        "plazos hasta la escrituración.",
        "body": _contract_compraventa(),
    },
]

_SLUGS = {t["slug"]: t for t in TEMPLATES}


def _render(template: dict) -> str:
    return f"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>{template['title']} · LibreInmuebles</title>
<style>
  body {{ font-family: 'Segoe UI', Arial, sans-serif; max-width: 820px; margin: 40px auto;
         padding: 0 24px; color: #1f2937; line-height: 1.6; }}
  header {{ text-align: center; border-bottom: 2px solid #0f766e; padding-bottom: 12px; margin-bottom: 20px; }}
  h1 {{ font-size: 22px; color: #0f766e; margin: 0 0 4px; }}
  h2 {{ font-size: 13px; font-weight: 400; color: #6b7280; margin: 0; }}
  h3 {{ font-size: 17px; margin-top: 28px; }}
  .aviso {{ background: #ecfdf5; border: 1px solid #10b981; color: #065f46; border-radius: 8px;
            padding: 12px 14px; font-size: 13px; margin: 20px 0; }}
  p {{ text-align: justify; }}
</style>
</head>
<body>
<header>
  <h1>{template['title']}</h1>
  <h2>Generado por LibreInmuebles — Paso de los Libres, Corrientes · Fecha: [FECHA]</h2>
</header>
<div class="aviso">{DISCLAIMER}</div>
{template['body']}
</body>
</html>"""


@router.get("/templates", summary="Lista de plantillas legales disponibles")
def list_templates() -> dict:
    return {
        "templates": [
            {
                "slug": t["slug"],
                "title": t["title"],
                "kind": t["kind"],
                "description": t["description"],
            }
            for t in TEMPLATES
        ]
    }


@router.get(
    "/templates/{slug}/download",
    summary="Descargar plantilla (documento .doc editable)",
)
def download_template(slug: str) -> Response:
    template = _SLUGS.get(slug)
    if template is None:
        return JSONResponse(status_code=404, content={"detail": "Plantilla no encontrada."})
    html = _render(template)
    filename = f"libreinmuebles-{slug}.doc"
    return Response(
        content=html,
        media_type="application/msword",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )