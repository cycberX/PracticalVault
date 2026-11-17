// Build
// gcc server.c -o server

// Start
// ./server

#include <stdio.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>
#include <stdlib.h>

int main()
{
    int fd, fd1;
    char buff[512] = "Hi \nWelcome to IPC \nBYEEE";
    char buff1[512] = {0};

    mkfifo("fifo", 0666);
    mkfifo("fifo1", 0666);

    fd = open("fifo", O_WRONLY);
    write(fd, buff, sizeof(buff));
    close(fd);

    fd1 = open("fifo1", O_RDONLY);
    read(fd1, buff1, sizeof(buff1) - 1);
    close(fd1);

    printf("\nThe response from client is = %s\n", buff1);

    unlink("fifo");
    unlink("fifo1");

    return 0;
}