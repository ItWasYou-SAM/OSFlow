#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <assert.h>
#include "common.h"

int main(int argc, char *argv[]) {
    int *p = malloc(sizeof(int));          // a1: grab some memory
    assert(p != NULL);
    printf("(%d) address pointed to by p: %p\n",
           getpid(), p);                   // a2: where is it?
    *p = 0;                                // a3: store zero there
    while (1) {
        Spin(1);
        *p = *p + 1;
        printf("(%d) p: %d\n", getpid(), *p); // a4
    }
    return 0;
}
