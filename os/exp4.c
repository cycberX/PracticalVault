// Build
// gcc main.c -o main -pthread

// Start
// ./main

#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
#include <semaphore.h>
#include <unistd.h>

#define N 5

sem_t fork_sem[N];

void *philosopher(void *num)
{
    int id = *(int *)num;
    int left = id;
    int right = (id + 1) % N;

    for (int i = 0; i < 3; i++)
    {
        printf("Philosopher %d is thinking...\n", id);
        sleep(1);

        if (id == N - 1)
        {
            sem_wait(&fork_sem[right]);
            printf("Philosopher %d picked up fork %d (right)\n", id, right);

            sem_wait(&fork_sem[left]);
            printf("Philosopher %d picked up fork %d (left)\n", id, left);
        }
        else
        {
            sem_wait(&fork_sem[left]);
            printf("Philosopher %d picked up fork %d (left)\n", id, left);

            sem_wait(&fork_sem[right]);
            printf("Philosopher %d picked up fork %d (right)\n", id, right);
        }

        printf("Philosopher %d is EATING...\n", id);
        sleep(1);

        sem_post(&fork_sem[left]);
        sem_post(&fork_sem[right]);

        printf("Philosopher %d put down both forks\n", id);
    }

    return NULL;
}

int main()
{
    pthread_t philo[N];
    int ids[N];

    for (int i = 0; i < N; i++)
    {
        sem_init(&fork_sem[i], 0, 1);
    }

    for (int i = 0; i < N; i++)
    {
        ids[i] = i;
        pthread_create(&philo[i], NULL, philosopher, &ids[i]);
    }

    for (int i = 0; i < N; i++)
    {
        pthread_join(philo[i], NULL);
    }

    for (int i = 0; i < N; i++)
    {
        sem_destroy(&fork_sem[i]);
    }

    printf("All philosophers have finished eating. No deadlock occurred.\n");

    return 0;
}