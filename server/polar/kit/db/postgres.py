from typing import Any, TypeAlias

from sqlalchemy import Engine
from sqlalchemy import create_engine as _create_engine
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
)
from sqlalchemy.ext.asyncio import (
    create_async_engine as _create_async_engine,
)
from sqlalchemy.orm import Session, sessionmaker

from ..extensions.sqlalchemy import sql


def create_async_engine(
    *,
    dsn: str,
    application_name: str | None = None,
    pool_size: int | None = None,
    pool_recycle: int | None = None,
    command_timeout: float | None = None,
    debug: bool = False,
) -> AsyncEngine:
    connect_args: dict[str, Any] = {}
    if application_name is not None:
        connect_args["server_settings"] = {"application_name": application_name}
    if command_timeout is not None:
        connect_args["command_timeout"] = command_timeout

    return _create_async_engine(
        dsn,
        echo=debug,
        connect_args=connect_args,
        pool_size=pool_size,
        pool_recycle=pool_recycle,
    )


def create_sync_engine(
    *,
    dsn: str,
    application_name: str | None = None,
    pool_size: int | None = None,
    pool_recycle: int | None = None,
    command_timeout: float | None = None,
    debug: bool = False,
) -> Engine:
    connect_args: dict[str, Any] = {}
    if application_name is not None:
        connect_args["application_name"] = application_name
    if command_timeout is not None:
        connect_args["options"] = f"-c statement_timeout={int(command_timeout * 1000)}"
    return _create_engine(
        dsn,
        echo=debug,
        connect_args=connect_args,
        pool_size=pool_size,
        pool_recycle=pool_recycle,
    )


AsyncSessionMaker: TypeAlias = async_sessionmaker[AsyncSession]


def create_async_sessionmaker(engine: AsyncEngine) -> async_sessionmaker[AsyncSession]:
    return async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


SyncSessionMaker: TypeAlias = sessionmaker[Session]


def create_sync_sessionmaker(engine: Engine) -> sessionmaker[Session]:
    return sessionmaker(engine, expire_on_commit=False)


__all__ = [
    "AsyncSession",
    "AsyncEngine",
    "Session",
    "Engine",
    "AsyncSessionMaker",
    "SyncSessionMaker",
    "create_async_engine",
    "create_sync_engine",
    "create_async_sessionmaker",
    "create_sync_sessionmaker",
    "sql",
]
