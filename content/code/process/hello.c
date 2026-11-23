#include <stdio.h>
#include <stdlib.h>

int total = 0;                     // static data: lives in the data segment

int main(int argc, char *argv[]) {
    int n = argc;                  // local variable: lives on the stack
    int *p = malloc(sizeof(int));  // dynamic memory: lives on the heap
    *p = n * 10;
    total += *p;
    printf("total = %d\n", total);
    return 0;
}
