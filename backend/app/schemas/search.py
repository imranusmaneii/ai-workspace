from pydantic import BaseModel
from uuid import UUID


class SearchResultChat(BaseModel):
    id: UUID
    title: str
    snippet: str


class SearchResultDocument(BaseModel):
    id: UUID
    filename: str
    snippet: str


class SearchResponse(BaseModel):
    chats: list[SearchResultChat]
    documents: list[SearchResultDocument]
