from typing import Annotated

from pydantic import BeforeValidator, EmailStr, StringConstraints

NormalizedEmailStr = Annotated[EmailStr, BeforeValidator(lambda v: v.strip().lower() if isinstance(v, str) else v)]

NameStr = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]
PhoneStr = Annotated[str | None, StringConstraints(strip_whitespace=True, max_length=30)]

TitleStr = Annotated[str, StringConstraints(strip_whitespace=True, min_length=3, max_length=200)]
DescriptionStr = Annotated[str, StringConstraints(strip_whitespace=True, min_length=10)]
NeighborhoodStr = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]
AddressStr = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=255)]

InquiryMessageStr = Annotated[str, StringConstraints(strip_whitespace=True, min_length=3, max_length=2000)]