import os
import sys
sys.path.insert(0, os.path.abspath('.'))

# Thông tin dự án
project = 'CodeGrid'
copyright = '2026, zskbot'
author = 'zskbot'
release = '0.1'

# Cấu hình chung
extensions = [
    'sphinx.ext.autodoc',
    'sphinx.ext.napoleon',
    'sphinx.ext.viewcode',
]

templates_path = ['_templates']
exclude_patterns = ['_build', 'Thumbs.db', '.DS_Store']

language = 'en'

# Giao diện hiển thị (Theme)
html_theme = 'sphinx_rtd_theme'
html_static_path = ['_static']
