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
    "Barrio Inmaculada",
    "Barrio San José",
    "Cattaneo",
    "Barrio Belgrano",
    "La Merced",
    "Isondu",
    "Hugo Wraz",
    "Río Uruguay",
]