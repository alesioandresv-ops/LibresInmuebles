""""inquiry replies" (chat in-app)

Revision ID: e3a5d9c2b4f1
Revises: b7f4210c9e5a
Create Date: 2026-09-24

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e3a5d9c2b4f1'
down_revision: Union[str, None] = 'b7f4210c9e5a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'inquiry_replies',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('inquiry_id', sa.Integer(), nullable=False),
        sa.Column('sender_id', sa.Integer(), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.ForeignKeyConstraint(['inquiry_id'], ['inquiries.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['sender_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_inquiry_replies_inquiry_id'), 'inquiry_replies', ['inquiry_id'], unique=False)
    op.create_index(op.f('ix_inquiry_replies_sender_id'), 'inquiry_replies', ['sender_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_inquiry_replies_sender_id'), table_name='inquiry_replies')
    op.drop_index(op.f('ix_inquiry_replies_inquiry_id'), table_name='inquiry_replies')
    op.drop_table('inquiry_replies')