; what the compiler turns `counter++` into (x86)
mov  0x8049a1c, %eax   ; 1. load counter into a register
add  $0x1, %eax        ; 2. add one to the register
mov  %eax, 0x8049a1c   ; 3. store the register back
