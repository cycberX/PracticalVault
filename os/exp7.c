// Build
// gcc main.c -o main

// Start
// ./main

#include <stdio.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <stdlib.h>

int main()
{
    char ch, buff[100] = {0}, buff1[100] = {0};
    FILE *fp;
    int fd[2];
    pid_t pid;

    if (pipe(fd) == -1)
    {
        perror("Pipe creation failed");
        return 1;
    }

    pid = fork();

    if (pid < 0)
    {
        perror("Fork failed");
        return 1;
    }

    if (pid > 0)
    {
        printf("\nThis is parent process with PID = %d\n", getpid());

        close(fd[0]);

        printf("Enter the name of file to send to child: ");
        scanf("%99s", buff);

        write(fd[1], buff, sizeof(buff));
        close(fd[1]);

        wait(NULL);
    }
    else
    {
        close(fd[1]);

        read(fd[0], buff1, sizeof(buff1) - 1);
        close(fd[0]);

        printf("\nThis is child process with PID = %d\n", getpid());
        printf("The name of file sent by parent is = %s\n", buff1);

        fp = fopen(buff1, "r");

        if (fp == NULL)
        {
            perror("Cannot open the file");
            exit(1);
        }

        printf("\nFile contents:\n");

        while ((ch = fgetc(fp)) != EOF)
        {
            putchar(ch);
        }

        fclose(fp);
    }

    return 0;
}