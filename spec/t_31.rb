{
  'pageSize' => 'A4',
  'pageOrientation' => 'landscape',
  'pageMargins' => [ 7, 35, 7, 91 ],
  'images' => {},
  'content' => [
    { 'svg' => " <svg width=\"300\">  <path /> </svg>" },
    { 'svg' => ' <svg width="400"><path /></svg>',
      'fit' => [ 150, 100 ] },
    { 'svg' => '<svg width="500"><path /></svg>',
      'width' => '100', 'height' => 200 },
  ]
}
