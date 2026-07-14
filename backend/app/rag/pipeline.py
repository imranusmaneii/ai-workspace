import uuid
from langchain.text_splitter import RecursiveCharacterTextSplitter
from app.rag.chroma import add_documents, delete_document_chunks

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    length_function=len,
)


def chunk_and_store(workspace_id: str, document_id: str, content: str, metadata: dict) -> int:
    chunks = text_splitter.split_text(content)
    if not chunks:
        return 0

    ids = [str(uuid.uuid4()) for _ in chunks]
    metadatas = [
        {**metadata, "document_id": document_id, "chunk_index": i}
        for i in range(len(chunks))
    ]

    add_documents(
        workspace_id=workspace_id,
        ids=ids,
        documents=chunks,
        metadatas=metadatas,
    )

    return len(chunks)


def retrieve_context(workspace_id: str, query: str, n_results: int = 5) -> str:
    from app.rag.chroma import query_documents

    results = query_documents(workspace_id, query, n_results)
    if not results:
        return ""

    context_parts = []
    for r in results:
        source = r["metadata"].get("filename", "unknown")
        context_parts.append(f"[Source: {source}]\n{r['document']}")
    return "\n\n---\n\n".join(context_parts)


def remove_document(workspace_id: str, document_id: str):
    delete_document_chunks(workspace_id, document_id)
