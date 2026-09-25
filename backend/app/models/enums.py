import enum


class UserRole(str, enum.Enum):
    OWNER = "propietario"
    SEEKER = "buscador"


class OperationType(str, enum.Enum):
    RENT_PERMANENT = "alquiler_permanente"
    RENT_TEMPORAL = "alquiler_temporal"
    SALE = "venta"


class PropertyType(str, enum.Enum):
    HOUSE = "casa"
    APARTMENT = "departamento"
    LAND = "terreno"
    COMMERCIAL = "salon_comercial"


class PropertyCurrency(str, enum.Enum):
    ARS = "ARS"
    USD = "USD"


class PropertyStatus(str, enum.Enum):
    AVAILABLE = "disponible"
    NEGOTIATION = "en_negociacion"
    FINISHED = "finalizada"


class ReportReason(str, enum.Enum):
    SPAM = "spam"
    FAKE_AGENT = "intermediario_real"
    FALSE_DATA = "datos_falsos"
    DUPLICATE = "duplicada"
    OTHER = "otro"


class ReportStatus(str, enum.Enum):
    PENDING = "pendiente"
    REVIEWED = "revisado"
    REJECTED = "rechazado"


SUGGESTED_NEIGHBORHOODS = [
    "Centro",
    "Costanera",
    "Zapadores",
    "Chaquito",
    "Picaflor",
    "Santa Rosa",
    "San Cayetano",
    "Caá Guazú",
    "Ombucito",
    "El Palmar",
    "Las Carmelitas",
    "Héroes de Malvinas",
    "Facundo Quiroga",
    "René Favaloro",
    "Santa Bárbara",
    "Terminal",
    "Suboficiales Yapeyú",
    "Simeón Paiba",
    "Catamarca",
    "Lomas Valentinas",
    "Primavera",
    "Las Flores",
    "San Martín",
    "La Amelia",
    "La Florida",
    "Las Palmas",
    "Nueva Esperanza",
    "Barrio 508",
    "Sector 300",
    "255 Viviendas",
    "99 Viviendas",
    "80 Viviendas",
    "60 Viviendas",
    "40 Viviendas",
    "30 Viviendas",
    "20 Viviendas",
    "17 de Agosto",
    "154 Viviendas",
    "132 Viviendas (Tablitas)",
]