
import json
import re
from pathlib import Path


# --------------------------------------------------
# Paths
# --------------------------------------------------
PROJECT_DIR = Path(__file__).resolve().parent.parent

INPUT_PATH = PROJECT_DIR / "outputs" / "extracted_text.txt"
OUTPUT_PATH = PROJECT_DIR / "outputs" / "document_information.json"


# --------------------------------------------------
# Common helpers
# --------------------------------------------------
def read_text_file(file_path):
    """Read OCR text while preserving Hindi and other Unicode characters."""
    path = Path(file_path)

    if not path.is_file():
        raise FileNotFoundError(f"OCR text file not found: {path}")

    return path.read_text(encoding="utf-8-sig")


def normalize_text(text):
    """Normalize whitespace without merging separate OCR lines."""
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{2,}", "\n", text)
    return text.strip()


def find_first(patterns, text, flags=re.IGNORECASE):
    """Return the first captured value from a list of regex patterns."""
    for pattern in patterns:
        match = re.search(pattern, text, flags)
        if match:
            value = (match.group(1) if match.lastindex and match.lastindex >= 1 else match.group(0)).strip(" \t:,-।")
            if value:
                return value
    return None


def unique_matches(pattern, text, flags=re.IGNORECASE):
    """Return unique captured values in the order they appear."""
    results = []

    for match in re.finditer(pattern, text, flags):
        value = (match.group(1) if match.lastindex and match.lastindex >= 1 else match.group(0)).strip(" \t:,-।")
        if value and value not in results:
            results.append(value)

    return results


# --------------------------------------------------
# Reusable patterns
# --------------------------------------------------
NUMBER = r"\d[\d,]*(?:\.\d{1,4})?"

DATE_PATTERN = (
    r"(?:"
    r"\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}"
    r"|\d{4}[-/.]\d{1,2}[-/.]\d{1,2}"
    r"|\d{1,2}\s+"
    r"(?:January|February|March|April|May|June|July|August|"
    r"September|October|November|December)\s+\d{4}"
    r"|\d{1,2}\s+"
    r"(?:जनवरी|फरवरी|मार्च|अप्रैल|मई|जून|जुलाई|अगस्त|"
    r"सितंबर|सितम्बर|अक्टूबर|नवंबर|नवम्बर|दिसंबर|दिसम्बर)"
    r"\s+\d{4}"
    r")"
)

CURRENCY_AMOUNT = (
    r"(?:₹|Rs\.?|INR|रु\.?|र)\s*"
    r"(" + NUMBER + r")"
)


# --------------------------------------------------
# Main information extraction
# --------------------------------------------------
def extract_document_information(text):
    """
    Extract common land-document fields using rules and regular expressions.

    This is a baseline information extractor, not a fraud classifier.
    Always verify extracted fields against the original document.
    """
    text = normalize_text(text)

    info = {
        "document_details": {},
        "owner_details": {},
        "address_details": {},
        "land_details": {},
        "financial_details": {},
        "date_details": {},
        "registration_details": {},
        "other_information": {},
    }

    # --------------------------------------------------
    # 1. Document type and purpose
    # --------------------------------------------------
    document_type = find_first([
        r"\b(sale\s+deed|lease\s+deed|gift\s+deed|"
        r"conveyance\s+deed|agreement(?:\s+deed)?|"
        r"affidavit|declaration|property\s+deed)\b",
        r"(विक्रय\s+पत्र|बिक्री\s+पत्र|इकरारनामा|समझौता\s+पत्र|"
        r"घोषणा\s+पत्र|दान\s+पत्र|पट्टा|शपथ\s+पत्र)",
    ], text)

    info["document_details"] = {
        "document_type": document_type,
        "document_purpose": find_first([
            r"(?:purpose|document\s+for)\s*[:\-]?\s*([^\n.]+)",
            r"(?:उद्देश्य|प्रयोजन)\s*[:\-]?\s*([^\n।]+)",
        ], text),
    }

    # --------------------------------------------------
    # 2. Owner and related persons
    # --------------------------------------------------
    owner = find_first([
        r"(?:owner(?:'s)?\s+name|name\s+of\s+owner|landowner)"
        r"\s*[:\-]?\s*([^\n,;]+)",
        r"(?:श्री/श्रीमती|श्री|श्रीमती)\s*"
        r"([^,\n।]+?)\s+पुत्र",
    ], text)

    father = find_first([
        r"(?:father(?:'s)?\s+name|son\s+of|s/o)"
        r"\s*[:\-]?\s*([^\n,;]+)",
        r"पुत्र\s+(?:श्री\s*)?([^,\n।]+)",
    ], text)

    info["owner_details"] = {
        "owner_name": owner,
        "father_name": father,
        "other_named_persons": unique_matches(
            r"(?:buyer|seller|purchaser|विक्रेता|क्रेता)"
            r"\s*[:\-]?\s*([^\n,;।]+)",
            text,
        ),
    }

    # --------------------------------------------------
    # 3. Address and location
    # --------------------------------------------------
    info["address_details"] = {
        "village": find_first([
            r"(?:village|gram)\s*[:\-]?\s*"
            r"([A-Za-z][A-Za-z .'-]*?)(?=\s*,|\s*\n|$)",
            r"(?:ग्राम|गांव|गाँव)\s+([^,\n।]+)",
        ], text),

        "tehsil": find_first([
            r"(?:tehsil|tahsil|taluka)\s*[:\-]?\s*"
            r"([A-Za-z][A-Za-z .'-]*?)(?=\s*,|\s*\n|$)",
            r"तहसील\s+([^,\n।]+)",
        ], text),

        "district": find_first([
            r"(?:district|zilla|zila)\s*[:\-]?\s*"
            r"([A-Za-z][A-Za-z .'-]*?)(?=\s*,|\s*\n|$)",
            r"जिला\s+([^,\n।]+)",
        ], text),

        "state": find_first([
            r"\b(Uttar Pradesh|Madhya Pradesh|Rajasthan|"
            r"Maharashtra|Bihar|Haryana|Punjab|Gujarat|"
            r"Uttarakhand|Jharkhand|Chhattisgarh|"
            r"Himachal Pradesh)\b",
            r"(उत्तर प्रदेश|मध्य प्रदेश|राजस्थान|महाराष्ट्र|"
            r"बिहार|हरियाणा|पंजाब|गुजरात|उत्तराखंड|"
            r"झारखंड|छत्तीसगढ़)",
        ], text),
    }

    # --------------------------------------------------
    # 4. Land record details
    # --------------------------------------------------
    survey_no = find_first([
        r"(?:survey|khasra|plot|khata)\s*"
        r"(?:no\.?|number|num)?\s*[:#\-]?\s*"
        r"([A-Za-z0-9/-]+)",
        r"(?:खसरा|सर्वे|गाटा|प्लॉट|खाता)\s*"
        r"(?:संख्या|नंबर|नं\.?)?\s*[:#\-]?\s*"
        r"([0-9/-]+)",
    ], text)

    area_match = re.search(
        r"(?:land\s+area|area|रकबा|क्षेत्रफल)\s*[:\-]?\s*"
        r"(" + NUMBER + r")\s*"
        r"(hectares?|hectare|ha\b|acres?|acre|"
        r"hectares?\b|हेक्टेयर|एकड़|बीघा)?",
        text,
        re.IGNORECASE,
    )

    area = None
    if area_match:
        area = {
            "value": area_match.group(1).replace(",", ""),
            "unit": area_match.group(2),
        }

    info["land_details"] = {
        "survey_or_khasra_number": survey_no,
        "area": area,
        "land_type": find_first([
            r"(?:land\s+type|type\s+of\s+land)"
            r"\s*[:\-]?\s*([^\n,;]+)",
            r"(कृषि भूमि|आवासीय भूमि|व्यावसायिक भूमि|औद्योगिक भूमि)",
        ], text),
        "pargana": find_first([
            r"\bpargana\s*[:\-]?\s*([A-Za-z .'-]+)",
            r"परगना\s+([^,\n।]+)",
        ], text),
    }

    # --------------------------------------------------
    # 5. Financial information
    # --------------------------------------------------
    # Label-based patterns are preferred because a number alone
    # cannot tell us whether it is a sale price or stamp duty.
    sale_amount = find_first([
        r"(?:sale\s*/?\s*transfer\s+amount|transaction\s+amount|"
        r"consideration\s+amount|sale\s+price|total\s+amount)"
        r"\s*[:\-]?\s*(?:₹|Rs\.?|INR|रु\.?|र)?\s*"
        r"(" + NUMBER + r")",
        r"(?:बिक्री|विक्रय|हस्तांतरण)\s*(?:/|\s)*"
        r"(?:हस्तांतरण)?\s*(?:राशि|मूल्य|कीमत)"
        r"\s*[:\-]?\s*(?:₹|Rs\.?|INR|रु\.?|र)?\s*"
        r"(" + NUMBER + r")",
    ], text)

    stamp_amount = find_first([
        r"(?:stamp\s+duty|stamp\s+fee|stamp\s+value)"
        r"\s*[:\-]?\s*(?:₹|Rs\.?|INR|रु\.?|र)?\s*"
        r"(" + NUMBER + r")",
        r"(?:स्टाम्प|स्टांप)\s*(?:शुल्क|मूल्य|ड्यूटी)"
        r"\s*[:\-]?\s*(?:₹|Rs\.?|INR|रु\.?|र)?\s*"
        r"(" + NUMBER + r")",
        # Amount followed by stamp-related wording.
        r"(?:₹|Rs\.?|INR|रु\.?)\s*(" + NUMBER + r")"
        r"(?=[^\n]{0,60}(?:stamp|स्टाम्प|स्टांप))",
        r"(" + NUMBER + r")\s*"
        r"(?=[^\n]{0,40}(?:स्टाम्प\s+शुल्क|stamp\s+duty))",
    ], text)

    # Include common currency symbols and OCR's rupee-symbol
    # confusion, but do not assume every number is money.
    amounts_found = unique_matches(
        CURRENCY_AMOUNT,
        text,
    )

    info["financial_details"] = {
        "amounts_found": amounts_found,
        "sale_or_transaction_amount": sale_amount,
        "stamp_duty_amount": stamp_amount,
        "currency": (
            "INR"
            if re.search(
                r"₹|\bINR\b|\bRs\.?|रु\.?|र\s*\d",
                text,
                re.IGNORECASE,
            )
            else None
        ),
    }

    # --------------------------------------------------
    # 6. Dates
    # --------------------------------------------------
    dates = unique_matches(DATE_PATTERN, text)

    document_date = find_first([
        r"(?:document\s+date|agreement\s+date|execution\s+date|dated)"
        r"\s*[:\-]?\s*(" + DATE_PATTERN + r")",
        r"(?:दिनांक|तारीख)\s*[:\-]?\s*(" + DATE_PATTERN + r")",
    ], text)

    # OCR sometimes puts the label and date on separate lines.
    if not document_date:
        document_date = find_first([
            r"(?:दिनांक|तारीख)\s*\n\s*(" + DATE_PATTERN + r")",
        ], text)

    info["date_details"] = {
        "all_dates_found": dates,
        "document_date": document_date,
    }

    # --------------------------------------------------
    # 7. Registration and legal information
    # --------------------------------------------------
    info["registration_details"] = {
        "registration_number": find_first([
            r"(?:registration\s*(?:no\.?|number)|reg\.?\s*no\.?)"
            r"\s*[:#\-]?\s*([A-Za-z0-9/-]+)",
            r"(?:पंजीकरण\s*(?:संख्या|नंबर|सं\.?))"
            r"\s*[:#\-]?\s*([A-Za-z0-9/-]+)",
        ], text),

        "stamp_number": find_first([
            r"(?:stamp\s*(?:no\.?|number|certificate\s+no\.?))"
            r"\s*[:#\-]?\s*([A-Za-z0-9/-]+)",
            r"(?:स्टाम्प|स्टांप)\s*(?:संख्या|नंबर|नं\.?)"
            r"\s*[:#\-]?\s*([A-Za-z0-9/-]+)",
        ], text),

        "signature_mentioned_in_text": bool(re.search(
            r"signature|signed|हस्ताक्षर",
            text,
            re.IGNORECASE,
        )),

        "fingerprint_mentioned_in_text": bool(re.search(
            r"fingerprint|thumb\s*impression|"
            r"अंगूठा निशान|अंगूठे का निशान|अंगूठा छाप",
            text,
            re.IGNORECASE,
        )),
    }

    # --------------------------------------------------
    # 8. Important statements
    # --------------------------------------------------
    keywords = [
        "ownership", "transfer", "sale", "purchase",
        "agriculture", "dispute", "boundary", "witness",
        "विक्रय", "हस्तांतरण", "स्वामित्व", "कृषि भूमि",
        "विवाद", "सीमा", "गवाह", "प्रतिफल",
    ]

    important_statements = []

    for line in text.splitlines():
        line = line.strip()
        if line and any(word.casefold() in line.casefold()
                        for word in keywords):
            if line not in important_statements:
                important_statements.append(line)

    info["other_information"] = {
        "important_statements": important_statements,
    }

    return info


# --------------------------------------------------
# Save extracted information
# --------------------------------------------------
def main():
    try:
        text = read_text_file(INPUT_PATH)
        information = extract_document_information(text)

        OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

        with OUTPUT_PATH.open("w", encoding="utf-8") as file:
            json.dump(
                information,
                file,
                ensure_ascii=False,
                indent=4,
            )

        print(json.dumps(
            information,
            ensure_ascii=False,
            indent=4,
        ))
        print(f"\nInformation saved to: {OUTPUT_PATH}")

    except FileNotFoundError as error:
        print(f"ERROR: {error}")
        print("Run OCR.py first to generate extracted_text.txt.")

    except (OSError, json.JSONDecodeError) as error:
        print(f"ERROR: Could not process the document: {error}")


if __name__ == "__main__":
    main()