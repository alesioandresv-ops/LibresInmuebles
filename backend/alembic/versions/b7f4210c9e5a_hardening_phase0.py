"""hardening phase 0: is_staff, indexes, unique reporter_property

Revision ID: b7f4210c9e5a
Revises: 325b432efd7e
Create Date: 2026-09-23 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b7f4210c9e5a'
down_revision: Union[str, None] = '325b432efd7e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table('users') as batch_op:
        batch_op.add_column(
            sa.Column('is_staff', sa.Boolean(), nullable=False, server_default=sa.false())
        )

    op.create_index(op.f('ix_properties_created_at'), 'properties', ['created_at'], unique=False)

    with op.batch_alter_table('reports') as batch_op:
        batch_op.create_index(op.f('ix_reports_reporter_id'), ['reporter_id'], unique=False)
        batch_op.create_unique_constraint('uq_reports_reporter_property', ['reporter_id', 'property_id'])


def downgrade() -> None:
    with op.batch_alter_table('reports') as batch_op:
        batch_op.drop_constraint('uq_reports_reporter_property', type_='unique')
        batch_op.drop_index(op.f('ix_reports_reporter_id'))
    op.drop_index(op.f('ix_properties_created_at'), table_name='properties')
    with op.batch_alter_table('users') as batch_op:
        batch_op.drop_column('is_staff')