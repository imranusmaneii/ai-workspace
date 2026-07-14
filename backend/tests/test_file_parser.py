from app.rag.file_parser import FileParser


def test_get_file_type():
    assert FileParser.get_file_type("document.pdf") == "pdf"
    assert FileParser.get_file_type("image.png") == "image"
    assert FileParser.get_file_type("code.py") == "code"
    assert FileParser.get_file_type("data.csv") == "text"
    assert FileParser.get_file_type("readme.txt") == "text"
    assert FileParser.get_file_type("notes.md") == "text"
    assert FileParser.get_file_type("unknown.xyz") == "unknown"
