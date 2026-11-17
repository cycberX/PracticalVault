// Build
// gcc client.c -o client

// Start
// ./client

#include <stdio.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>
#include <stdlib.h>

int main()
{
    FILE *fp;
    int fd, fd1, line = 1, word = 0, chr = 0, flag = 0;
    char msg[512] = {0}, msg1[512];

    mkfifo("fifo1", 0666);

    fd = open("fifo", O_RDONLY);
    read(fd, msg, sizeof(msg) - 1);
    close(fd);

    printf("\nThe message from server is = %s\n", msg);

    for (int i = 0; msg[i] != '\0'; i++)
    {
        char ch = msg[i];
        chr++;

        if (ch == '\n')
            line++;

        if (ch == ' ' || ch == '\n')
        {
            flag = 0;
        }
        else if (flag == 0)
        {
            word++;
            flag = 1;
        }
    }

    fp = fopen("analysis.txt", "w");

    if (fp == NULL)
    {
        printf("\nCannot open the file\n");
    }
    else
    {
        fprintf(fp, "\nNumber of lines = %d\n", line);
        fprintf(fp, "\nNumber of words = %d\n", word);
        fprintf(fp, "\nNumber of characters = %d\n", chr);

        fclose(fp);
    }

    sprintf(
        msg1,
        "\nNumber of lines = %d\nNumber of words = %d\nNumber of characters = %d\n",
        line, word, chr
    );

    fd1 = open("fifo1", O_WRONLY);
    write(fd1, msg1, sizeof(msg1));
    close(fd1);

    unlink("fifo");
    unlink("fifo1");

    return 0;
}