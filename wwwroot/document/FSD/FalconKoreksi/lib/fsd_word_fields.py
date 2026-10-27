"""Update Word fields (PAGEREF, etc.) via win32com on Windows."""
import os


def update_word_fields(docx_path: str) -> bool:
    """Open DOCX in Word, update all fields, save. Returns False if unavailable."""
    docx_path = os.path.abspath(docx_path)
    if not os.path.exists(docx_path):
        print(f'   [Fields] file tidak ditemukan: {docx_path}')
        return False
    try:
        import win32com.client  # type: ignore
    except ImportError:
        print('   [Fields] pywin32 tidak terpasang — tekan F9 di Word untuk update halaman')
        return False
    word = None
    doc = None
    try:
        word = win32com.client.Dispatch('Word.Application')
        word.Visible = False
        word.DisplayAlerts = 0
        doc = word.Documents.Open(docx_path, ReadOnly=False)
        doc.Fields.Update()
        for story in doc.StoryRanges:
            try:
                story.Fields.Update()
            except Exception:
                pass
        doc.Save()
        print('   [Fields] nomor halaman Daftar Gambar/Tabel di-update')
        return True
    except Exception as e:
        print(f'   [Fields] gagal update ({e}) — tekan F9 di Word untuk update halaman')
        return False
    finally:
        if doc is not None:
            doc.Close(SaveChanges=False)
        if word is not None:
            word.Quit()
