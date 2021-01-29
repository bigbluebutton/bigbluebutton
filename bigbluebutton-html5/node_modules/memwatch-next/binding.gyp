{
  'targets': [
    {
      'target_name': 'memwatch',
      'include_dirs': [
        "<!(node -e \"require('nan')\")"
      ],
      'sources': [
        'src/heapdiff.cc',
        'src/init.cc',
        'src/memwatch.cc',
        'src/util.cc'
      ]
    }
  ]
}
