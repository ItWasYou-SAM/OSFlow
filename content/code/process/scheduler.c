// Simplified: what the OS does each time it must pick a process to run
void schedule(void) {
    for (;;) {
        struct proc *p = pick_ready();   // policy: which ready process?
        if (p == NULL) {
            idle();                      // nothing ready: CPU sits idle
            continue;
        }
        p->state = RUNNING;              // Ready -> Running   (scheduled)
        run(p);                          // until it blocks, ends or is interrupted
        if (p->started_io) {
            p->state = BLOCKED;          // Running -> Blocked (initiates I/O)
        } else if (p->finished) {
            p->state = DONE;             // it has exited
        } else {
            p->state = READY;            // Running -> Ready   (descheduled)
        }
    }
}

void io_complete(struct proc *p) {       // called from the disk's interrupt
    p->state = READY;                    // Blocked -> Ready   (I/O done)
}
