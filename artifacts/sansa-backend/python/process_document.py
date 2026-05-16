import csv
import html
import json
import os
import re
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree


def clean_text(value: str) -> str:
    value = value.replace("\r\n", "\n").replace("\r", "\n")
    value = re.sub(r"[ \t]+", " ", value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    return value.strip()


def read_plain(path: Path) -> str:
    for encoding in ("utf-8", "utf-16", "latin-1"):
        try:
            return path.read_text(encoding=encoding, errors="ignore")
        except Exception:
            continue
    return ""


def extract_pdf(path: Path) -> str:
    try:
        import PyPDF2

        with path.open("rb") as handle:
            reader = PyPDF2.PdfFileReader(handle)
            return "\n\n".join(reader.getPage(index).extractText() or "" for index in range(reader.getNumPages()))
    except Exception:
        return ""


def xml_text(xml_bytes: bytes) -> str:
    try:
        root = ElementTree.fromstring(xml_bytes)
    except Exception:
        return ""

    values = []
    for node in root.iter():
        if node.text and node.text.strip():
            values.append(node.text.strip())
    return " ".join(values)


def extract_office_zip(path: Path, prefixes) -> str:
    try:
        archive = zipfile.ZipFile(path)
        parts = []
        for name in archive.namelist():
            if not name.endswith(".xml"):
                continue
            if not any(name.startswith(prefix) or name == prefix for prefix in prefixes):
                continue
            text = xml_text(archive.read(name))
            if text:
                parts.append(text)
        return "\n\n".join(parts)
    except Exception:
        return ""


def extract_docx(path: Path) -> str:
    return extract_office_zip(path, ["word/document.xml", "word/header", "word/footer"])


def extract_xlsx(path: Path) -> str:
    return extract_office_zip(path, ["xl/sharedStrings.xml", "xl/worksheets/"])


def extract_pptx(path: Path) -> str:
    return extract_office_zip(path, ["ppt/slides/", "ppt/notesSlides/"])


def extract_csv(path: Path) -> str:
    try:
        rows = []
        with path.open("r", encoding="utf-8", errors="ignore", newline="") as handle:
            reader = csv.reader(handle)
            for row in reader:
                rows.append(" | ".join(row))
        return "\n".join(rows)
    except Exception:
        return read_plain(path)


def extract_html(path: Path) -> str:
    text = read_plain(path)
    text = re.sub(r"<script[\s\S]*?</script>", " ", text, flags=re.I)
    text = re.sub(r"<style[\s\S]*?</style>", " ", text, flags=re.I)
    text = re.sub(r"<[^>]+>", " ", text)
    return html.unescape(text)


def extract(path: Path) -> str:
    ext = path.suffix.lower().lstrip(".")
    if ext == "pdf":
        return extract_pdf(path)
    if ext == "docx":
        return extract_docx(path)
    if ext in ("xlsx", "xls"):
        return extract_xlsx(path)
    if ext == "pptx":
        return extract_pptx(path)
    if ext == "csv":
        return extract_csv(path)
    if ext in ("html", "htm", "xml"):
        return extract_html(path)
    return read_plain(path)


def main() -> int:
    if len(sys.argv) < 2:
        print(json.dumps({"ok": False, "error": "Missing file path"}))
        return 2

    path = Path(sys.argv[1])
    if not path.exists():
        print(json.dumps({"ok": False, "error": "File not found"}))
        return 2

    text = clean_text(extract(path))
    result = {
        "ok": bool(text),
        "file": path.name,
        "extension": path.suffix.lower().lstrip("."),
        "bytes": os.path.getsize(path),
        "chars": len(text),
        "text": text,
    }
    print(json.dumps(result, ensure_ascii=False))
    return 0 if text else 1


if __name__ == "__main__":
    raise SystemExit(main())
