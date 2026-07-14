import chromadb
from app.core.config import get_settings

settings = get_settings()

_client: chromadb.ClientAPI | None = None


def get_chroma_client() -> chromadb.ClientAPI:
    global _client
    if _client is None:
        if settings.CHROMA_HOST and settings.CHROMA_HOST != "localhost":
            _client = chromadb.HttpClient(
                host=settings.CHROMA_HOST,
                port=settings.CHROMA_PORT,
            )
        else:
            _client = chromadb.PersistentClient(
                path="./chroma_data",
                settings=chromadb.Settings(anonymized_telemetry=False),
            )
    return _client


def get_workspace_collection(workspace_id: str):
    client = get_chroma_client()
    return client.get_or_create_collection(
        name=f"workspace_{workspace_id}",
        metadata={"hnsw:space": "cosine"},
    )


def add_documents(workspace_id: str, ids: list[str], documents: list[str], metadatas: list[dict]):
    collection = get_workspace_collection(workspace_id)
    collection.add(ids=ids, documents=documents, metadatas=metadatas)


def query_documents(workspace_id: str, query: str, n_results: int = 5) -> list[dict]:
    collection = get_workspace_collection(workspace_id)
    results = collection.query(query_texts=[query], n_results=n_results)
    output = []
    for i in range(len(results["ids"][0])):
        output.append({
            "id": results["ids"][0][i],
            "document": results["documents"][0][i],
            "metadata": results["metadatas"][0][i] if results["metadatas"] else {},
            "distance": results["distances"][0][i] if results["distances"] else 0,
        })
    return output


def delete_workspace_documents(workspace_id: str):
    client = get_chroma_client()
    try:
        client.delete_collection(f"workspace_{workspace_id}")
    except Exception:
        pass


def delete_document_chunks(workspace_id: str, document_id: str):
    collection = get_workspace_collection(workspace_id)
    results = collection.get(where={"document_id": document_id})
    if results["ids"]:
        collection.delete(ids=results["ids"])
