; x = x + 2   (x lives in memory at 0x1000)
mov  0x1000, %eax    ; load x into register eax
add  $2, %eax        ; eax = eax + 2
mov  %eax, 0x1000    ; store eax back into x
